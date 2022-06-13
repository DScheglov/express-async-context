import {
  NextFunction, Response, Request, ErrorRequestHandler, RequestHandler,
} from 'express';

export type ContextFactory<T> = (req: Request, res: Response) => T;

export type Thunk<T, R = void> = (context: T, run: RunFn<T>) => R;
export type RunFn<T> = <R>(fn: Thunk<T, R>) => R;

export type HandlerThunk<T> = (...args: Parameters<RequestHandler>) => Thunk<T>;
export type ErrorHandlerThunk<T> = (...args: Parameters<ErrorRequestHandler>) => Thunk<T>;

export interface ContextHolder<T> {
  run(context: T, req: Request, next: NextFunction): void;
  get(req: Request): T;
}

export type ContextHolderFactory<T> = () => ContextHolder<T>;

export interface ContextManager<T> {
  provider: (req: Request, res: Response, next: NextFunction) => void;
  consumer: {
    (handler: RequestHandler | HandlerThunk<T>): RequestHandler;
    (handler: ErrorRequestHandler | ErrorHandlerThunk<T>): ErrorRequestHandler;
  }
}
