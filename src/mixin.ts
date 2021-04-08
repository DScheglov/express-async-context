import createContext from './create-context';
import mixinHolder from './holders/mixin-holder';
import { ContextFactory, ContextHolderFactory } from './types';

const createAlsContext = <T>(
  contextFactory: ContextFactory<T>,
) => createContext<T>(contextFactory, mixinHolder as ContextHolderFactory<T>);

export default createAlsContext;
