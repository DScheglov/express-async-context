import Express from 'express';
import { ContextHolder } from '../types';

const createMixinContextHolder = <T>(): ContextHolder<T> => {
  const $context = Symbol('context');

  const run = (context: T, req: Express.Request, next: Express.NextFunction) => {
    Object.defineProperty(req, $context, {
      value: context,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    next();
  };

  const get = (req: Express.Request): T => (req as any)[$context];

  return { run, get };
};

export default createMixinContextHolder;
