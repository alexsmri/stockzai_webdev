import STO_KPI from "../stores/STO_KPI";
import { createStoreProvider } from "./CTX_BaseStore";

export const {
  useStore: useKPIStore,
  StoreProvider: PRV_KPIStore,
} = createStoreProvider(STO_KPI, "KPIStore");