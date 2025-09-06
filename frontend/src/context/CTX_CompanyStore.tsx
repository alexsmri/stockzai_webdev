import STO_Companies from '../stores/STO_Companies';
import { createAPIStoreProvider } from './CTX_BaseStore';

export const { useStore: useCompanyStore, StoreProvider: PRV_CompanyStore } =
  createAPIStoreProvider(STO_Companies, 'CompanyStore');
