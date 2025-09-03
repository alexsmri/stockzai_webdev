import STO_Users from '../stores/STO_Users';
import { createStoreProvider } from './CTX_BaseStore';

export const { useStore: useUserStore, StoreProvider: PRV_UserStore } = createStoreProvider(
  STO_Users,
  'UserStore'
);
