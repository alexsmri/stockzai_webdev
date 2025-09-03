import STO_Winners from '../stores/STO_Winners';
import { createAPIStoreProvider } from './CTX_BaseStore';

export const { useStore: useWinnerStore, StoreProvider: PRV_WinnerStore } = createAPIStoreProvider(
  STO_Winners,
  'WinnerStore'
);
