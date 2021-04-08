import createContext from './mixin';

describe('mixin.createCotnext', () => {
  it('creates a context manager', () => {
    const context = createContext<boolean>(() => true);
    expect(context).toBeDefined();
  });

  it('creates a context manager with provider-middleware', () => {
    const { provider } = createContext<boolean>(() => true);
    expect(provider).toBeInstanceOf(Function);
    expect(provider).toHaveLength(3);
  });

  it('creates a context manager with consumer decorator', () => {
    const { consumer } = createContext<boolean>(() => true);
    expect(consumer).toBeInstanceOf(Function);
  });
});
