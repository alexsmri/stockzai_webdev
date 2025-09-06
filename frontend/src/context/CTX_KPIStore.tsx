import STO_KPI from '../stores/STO_KPI';
import { createAPIStoreProvider } from './CTX_BaseStore';

export const { useStore: useKPIStore, StoreProvider: PRV_KPIStore } = createAPIStoreProvider(
  STO_KPI,
  'KPIStore'
);
