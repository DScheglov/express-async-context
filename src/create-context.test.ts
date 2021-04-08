import { NextFunction, Request, Response } from 'express';
import createContext from './create-context';
import { ContextHolder, RunFn } from './types';

describe('createCotnext', () => {
  const createHolder = <T>(): ContextHolder<T> => ({
    run: jest.fn((data: T, req: Request, n: NextFunction) => n()),
    get: jest.fn(),
  });

  it('creates a context manager', () => {
    const context = createContext<boolean>(() => true, createHolder);
    expect(context).toBeDefined();
  });

  it('creates a context manager with provider-middleware', () => {
    const { provider } = createContext<boolean>(() => true, createHolder);
    expect(provider).toBeInstanceOf(Function);
    expect(provider).toHaveLength(3);
  });

  it('creates a context manager with consumer decorator', () => {
    const { consumer } = createContext<boolean>(() => true, createHolder);
    expect(consumer).toBeInstanceOf(Function);
  });

  describe('context.provider', () => {
    const ctx = Symbol('ctx');
    const holder = createHolder<typeof ctx>();
    const contextFactory = jest.fn<typeof ctx, never[]>(() => ctx);
    const { provider } = createContext<typeof ctx>(contextFactory as any, () => holder);

    const next: NextFunction = () => {};
    const req = {} as Request;
    const res = {} as Response;

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('expect it calls contextFatory and passed the req to it', () => {
      provider(req, res, next);
      expect(contextFactory).toBeCalledTimes(1);
      expect(contextFactory).toHaveBeenCalledWith(req);
    });

    it('expect it calls holder.run and passed context, req and next to it', () => {
      provider(req, res, next);
      expect(holder.run).toBeCalledTimes(1);
      expect(holder.run).toHaveBeenCalledWith(ctx, req, next);
    });
  });

  describe('context.consumer', () => {
    const { consumer } = createContext<boolean>(() => true, createHolder);

    it('returns 3-arity handler if 2-arity handler passed', () => {
      expect(
        consumer(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (req: Request, res: Response) => {},
        ),
      ).toHaveLength(3);
    });

    it('returns 3-arity handler if 3-arity handler passed', () => {
      expect(
        consumer(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (req: Request, res: Response, next: NextFunction) => {},
        ),
      ).toHaveLength(3);
    });

    it('returns 4-arity handler if 4-arity handler passed', () => {
      expect(
        consumer(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (err: Error, req: Request, res: Response, next: NextFunction) => {},
        ),
      ).toHaveLength(4);
    });

    it('throws TypeError("Worng type of Handler) if arity is greater then 4', () => {
      expect(
        () => consumer(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ((err: Error, req: Request, res: Response, next: NextFunction, some: any) => {}) as any,
        ),
      ).toThrow(
        new TypeError('Wrong type of handler.'),
      );
    });
  });

  describe('handler as context.consumer', () => {
    const ctx = Symbol('ctx');
    const holder = createHolder<typeof ctx>();
    const contextFactory = jest.fn<typeof ctx, never[]>(() => ctx);
    const { consumer } = createContext<typeof ctx>(contextFactory as any, () => holder);

    const next: NextFunction = () => {};
    const req = {} as Request;
    const res = {} as Response;

    const effect = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('calls thunk2 and passes req, res and next to it, and not calls contextFactory', () => {
      const handlerThunk = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: Request, _res: Response) => effect,
      );
      const dHandler = consumer(handlerThunk);
      (holder.get as any).mockReturnValue(ctx);
      dHandler(req, res, next);
      expect(contextFactory).not.toHaveBeenCalled();
    });

    it('calls thunk2 and passes req, res and next to it, and also passes ctx to effect', () => {
      const handlerThunk = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: Request, _res: Response) => effect,
      );
      const dHandler = consumer(handlerThunk);
      dHandler(req, res, next);
      expect(handlerThunk).toHaveBeenCalledTimes(1);
      expect(handlerThunk).toHaveBeenCalledWith(req, res, next);
      expect(effect).toHaveBeenCalledTimes(1);
      expect(effect).toHaveBeenCalledWith(ctx, expect.any(Function));
    });

    it('calls handler2 and passes req, res and next to it, no effect called', () => {
      const handlerThunk = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: Request, _res: Response) => {},
      );
      const dHandler = consumer(handlerThunk);

      dHandler(req, res, next);
      expect(handlerThunk).toHaveBeenCalledTimes(1);
      expect(handlerThunk).toHaveBeenCalledWith(req, res, next);
      expect(effect).not.toHaveBeenCalled();
    });

    it('calls thunk3 and passes req, res and next to it, and also passes ctx to effect', () => {
      const handlerThunk = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: Request, _res: Response, _next: NextFunction) => effect,
      );
      const dHandler = consumer(handlerThunk);
      dHandler(req, res, next);
      expect(handlerThunk).toHaveBeenCalledTimes(1);
      expect(handlerThunk).toHaveBeenCalledWith(req, res, next);
      expect(effect).toHaveBeenCalledTimes(1);
      expect(effect).toHaveBeenCalledWith(ctx, expect.any(Function));
    });

    it('calls handler3 and passes req, res and next to it, no effect called', () => {
      const handlerThunk = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: Request, _res: Response, _next: NextFunction) => {},
      );
      const dHandler = consumer(handlerThunk);

      dHandler(req, res, next);
      expect(handlerThunk).toHaveBeenCalledTimes(1);
      expect(handlerThunk).toHaveBeenCalledWith(req, res, next);
      expect(effect).not.toHaveBeenCalled();
    });

    it('calls errorHandlerThunk and passes err, req, res and next to it, and also passes ctx to effect', () => {
      const handlerThunk = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (err: any, _req: Request, _res: Response, _next: NextFunction) => effect,
      );
      const dHandler = consumer(handlerThunk);
      const err = {};
      dHandler(err, req, res, next);
      expect(handlerThunk).toHaveBeenCalledTimes(1);
      expect(handlerThunk).toHaveBeenCalledWith(err, req, res, next);
      expect(effect).toHaveBeenCalledTimes(1);
      expect(effect).toHaveBeenCalledWith(ctx, expect.any(Function));
    });

    it('calls errorHandler and passes req, res and next to it, no effect called', () => {
      const handlerThunk = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (err: any, _req: Request, _res: Response, _next: NextFunction) => {},
      );
      const dHandler = consumer(handlerThunk);
      const err = {};
      dHandler(err, req, res, next);
      expect(handlerThunk).toHaveBeenCalledTimes(1);
      expect(handlerThunk).toHaveBeenCalledWith(err, req, res, next);
      expect(effect).not.toHaveBeenCalled();
    });
  });

  describe('injected run', () => {
    const ctx = Symbol('ctx');

    const { consumer } = createContext<typeof ctx>(() => ctx, createHolder);
    const next: NextFunction = () => {};
    const req = {} as Request;
    const res = {} as Response;

    it('calls function, passes context, itself and returns the function result', () => {
      const handlerThunk = () => (__: typeof ctx, run: RunFn<typeof ctx>) => {
        expect(run).toBeInstanceOf(Function);
        const fn = jest.fn(x => [x]);
        expect(run(fn)).toEqual([ctx]);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(ctx, run);
      };
      consumer(handlerThunk)(req, res, next);
    });
  });
});
