import createContext from './create-context';
import alsHolder from './holders/als-holder';
import { ContextFactory, ContextHolderFactory } from './types';

const createAlsContext = <T>(
  contextFactory: ContextFactory<T>,
) => createContext<T>(contextFactory, alsHolder as ContextHolderFactory<T>);

export default createAlsContext;
