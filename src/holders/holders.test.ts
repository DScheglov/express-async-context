import { Request } from 'express';
import { ContextHolderFactory } from '../types';
import createAlsHolder from './als-holder';
import createMixinHolder from './mixin-holder';

const delay = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

describe.each([
  ['AsyncLocalStorageContextHolder', createAlsHolder],
  ['RequestMixinContextHolder', createMixinHolder],
])('%s', (_, createHolder: ContextHolderFactory<any>) => {
  it('is a function', () => {
    expect(createHolder).toBeInstanceOf(Function);
  });

  it('creates object with get and run methods', () => {
    const holder = createHolder();
    expect(holder.get).toBeInstanceOf(Function);
    expect(holder.run).toBeInstanceOf(Function);
  });

  it('allows to pass context to the sync call', () => {
    const ctx = Symbol('ctx');
    const req = {} as Request;
    const holder = createHolder();
    const handler = jest.fn();
    const cb = () => handler(holder.get(req));

    holder.run(ctx, req, cb);
    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(ctx);
  });

  it('allows to pass context to the microtask call', async () => {
    const ctx = Symbol('ctx');
    const req = {} as Request;
    const holder = createHolder();
    const handler = jest.fn();
    const cb = () => Promise.resolve().then(() => handler(holder.get(req)));

    holder.run(ctx, req, cb);

    await delay();

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(ctx);
  });

  it('allows to pass context to the task call', async () => {
    const ctx = Symbol('ctx');
    const req = {} as Request;
    const holder = createHolder();
    const handler = jest.fn();
    const cb = () => setTimeout(() => handler(holder.get(req)), 0);

    holder.run(ctx, req, cb);

    await delay();

    expect(handler).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(ctx);
  });

  it('doesn\'t mixes context with several the sync call', () => {
    const n = Array.from({ length: 5 }, (__, i) => i);

    const ctx = n.map(i => Symbol(`ctx-${i}`));
    const req = n.map(() => ({} as Request));
    const holder = createHolder();
    const handler = n.map(() => jest.fn());
    const cb = n.map(i => () => handler[i](holder.get(req[i])));

    n.forEach(i => holder.run(ctx[i], req[i], cb[i]));

    n.forEach(i => {
      expect(handler[i]).toBeCalledTimes(1);
      expect(handler[i]).toBeCalledWith(ctx[i]);
    });
  });

  it('doesn\'t mixes context with several the microtasks call', async () => {
    const n = Array.from({ length: 5 }, (__, i) => i);

    const ctx = n.map(i => Symbol(`ctx-${i}`));
    const req = n.map(() => ({} as Request));
    const holder = createHolder();
    const handler = n.map(() => jest.fn());
    const cb = n.map(i => () => Promise.resolve().then(() => handler[i](holder.get(req[i]))));

    n.forEach(i => holder.run(ctx[i], req[i], cb[i]));

    await delay();

    n.forEach(i => {
      expect(handler[i]).toBeCalledTimes(1);
      expect(handler[i]).toBeCalledWith(ctx[i]);
    });
  });

  it('doesn\'t mixes context with several the tasks call', async () => {
    const n = Array.from({ length: 5 }, (__, i) => i);

    const ctx = n.map(i => Symbol(`ctx-${i}`));
    const req = n.map(() => ({} as Request));
    const holder = createHolder();
    const handler = n.map(() => jest.fn());
    const cb = n.map(i => () => setTimeout(() => handler[i](holder.get(req[i])), 0));

    n.forEach(i => holder.run(ctx[i], req[i], cb[i]));

    await delay();

    n.forEach(i => {
      expect(handler[i]).toBeCalledTimes(1);
      expect(handler[i]).toBeCalledWith(ctx[i]);
    });
  });
});
