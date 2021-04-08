import { NextFunction, Response, Request } from 'express';
import {
  Context,
  ContextFactory,
  ContextHolderFactory,
  HandlerThunk,
  ErrorHandlerThunk,
  RunFn,
  Handler,
  ErrorHandler,
} from './types';
import { throwTypeError } from './throwTypeError';

const createContext = <T>(
  contextFactory: ContextFactory<T>,
  contextHolderFactory: ContextHolderFactory<T>,
): Context<T> => {
  const context = contextHolderFactory();

  const inject = <S>(value: S, req: Request): S extends (...args: any[]) => infer R ? R : S => {
    if (typeof value !== 'function') return value as any;
    const ctx = context.get(req) ?? contextFactory(req);
    const run: RunFn<T> = fn => fn(ctx, run);
    return value(ctx, run);
  };

  const provider = (req: Request, res: Response, next: NextFunction): void =>
    context.run(contextFactory(req), req, next);

  const consumer: {
    (handler: HandlerThunk<T> | Handler): (req: Request, res: Response, next: NextFunction) => void;
    (handler: ErrorHandlerThunk<T> | ErrorHandler): (
      err: any, req: Request, res: Response, next: NextFunction
    ) => void;
  } = (handler: any) => (
    handler.length <= 3 ? (req: Request, res: Response, next: NextFunction) =>
      inject(handler(req, res, next), req) :
    handler.length === 4 ? (err: Error, req: Request, res: Response, next: NextFunction) =>
      inject(handler(err, req, res, next), req) :
    /* never */ throwTypeError('Wrong type of handler.')
  ) as any;

  return { provider, consumer };
};

export default createContext;
