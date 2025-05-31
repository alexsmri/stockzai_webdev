import CompanyStore from "../stores/CompanyStore";
import { createStoreProvider } from "./BaseStoreContext";

export const {
  useStore: useCompanyStore,
  StoreProvider: CompanyStoreProvider,
} = createStoreProvider(CompanyStore, "CompanyStore");