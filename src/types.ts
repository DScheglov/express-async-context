import {
  NextFunction, Response, Request, ErrorRequestHandler, RequestHandler,
} from 'express';

export type ContextFactory<T> = (req: Request) => T;

export type RunFn<T> = <R>(fn: (context: T, run: RunFn<T>) => R) => R;

export type EffectFn<T> = (context: T, run: RunFn<T>) => void

export type HandlerThunk<T> = (req: Request, res: Response, next: NextFunction) => EffectFn<T>;

export type ErrorHandlerThunk<T> = (...args: Parameters<ErrorRequestHandler>) => EffectFn<T>;

export interface ContextHolder<T> {
  run(context: T, req: Request, next: NextFunction): void;
  get(req: Request): T;
}

export type ContextHolderFactory<T> = () => ContextHolder<T>;

export type Handler = RequestHandler;
export type ErrorHandler = ErrorRequestHandler;

export type Context<T> = {
  provider: (req: Request, res: Response, next: NextFunction) => void;
  consumer: {
    (handler: Handler | HandlerThunk<T>): Handler;
    (handler: ErrorHandler | ErrorHandlerThunk<T>): ErrorHandler;
  }
}
