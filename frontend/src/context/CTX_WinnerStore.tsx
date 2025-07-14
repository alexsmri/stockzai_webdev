import STO_Winners from '../stores/STO_Winners';
import { createStoreProvider } from './CTX_BaseStore';

export const { useStore: useWinnerStore, StoreProvider: PRV_WinnerStore } = createStoreProvider(
  STO_Winners,
  'WinnerStore'
);
