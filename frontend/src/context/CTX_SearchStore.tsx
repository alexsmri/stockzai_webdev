import STO_Search from '../stores/STO_Search';
import { createAPIStoreProvider } from './CTX_BaseStore';

export const { useStore: useSearchStore, StoreProvider: PRV_SearchStore } = createAPIStoreProvider(
  STO_Search,
  'SearchStore'
);
