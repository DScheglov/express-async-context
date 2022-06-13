import {
  NextFunction, Response, Request, RequestHandler,
  ErrorRequestHandler,
} from 'express';
import {
  ContextManager,
  ContextFactory,
  ContextHolderFactory,
  HandlerThunk,
  ErrorHandlerThunk,
  RunFn,

} from './types';
import { throwTypeError } from './throwTypeError';

const createContext = <T>(
  contextFactory: ContextFactory<T>,
  contextHolderFactory: ContextHolderFactory<T>,
): ContextManager<T> => {
  const context = contextHolderFactory();

  const inject = <S>(value: S, req: Request, res: Response): void => {
    if (typeof value !== 'function') return;
    const ctx = context.get(req) ?? contextFactory(req, res);
    const run: RunFn<T> = fn => fn(ctx, run);
    value(ctx, run);
  };

  const provider = (req: Request, res: Response, next: NextFunction): void =>
    context.run(contextFactory(req, res), req, next);

  const consumer: {
    (handler: RequestHandler | HandlerThunk<T>): RequestHandler;
    (handler: ErrorRequestHandler | ErrorHandlerThunk<T>): ErrorRequestHandler;
  } = (handler: any) => (
    handler.length <= 3 ? (req: Request, res: Response, next: NextFunction) =>
      inject(handler(req, res, next), req, res) :
    handler.length === 4 ? (err: any, req: Request, res: Response, next: NextFunction) =>
      inject(handler(err, req, res, next), req, res) :
    /* never */ throwTypeError('Wrong type of handler.')
  ) as any;

  return { provider, consumer };
};

export default createContext;
