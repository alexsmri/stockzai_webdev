import STO_Companies from "../stores/STO_Companies";
import { createStoreProvider } from "./CTX_BaseStore";

export const {
  useStore: useCompanyStore,
  StoreProvider: PRV_CompanyStore,
} = createStoreProvider(STO_Companies, "CompanyStore");