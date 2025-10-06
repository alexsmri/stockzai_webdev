import STO_Companies from "../stores/STO_Companies";
import { createStoreProvider } from "./CTX_BaseStore";

export const { useStore: useCompaniesStore, StoreProvider: PRV_CompaniesStore } = createStoreProvider(
  STO_Companies,
  "CompaniesStore"
);
