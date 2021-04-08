import { AsyncLocalStorage } from 'async_hooks';
import Express from 'express';

const createAsyncStorageContextHolder = <T>() => {
  const asyncStorage = new AsyncLocalStorage<T>();

  const run = (context: T, req: any, next: Express.NextFunction) =>
    asyncStorage.run(context, next);

  const get = () => asyncStorage.getStore();

  return { run, get };
};

export default createAsyncStorageContextHolder;
