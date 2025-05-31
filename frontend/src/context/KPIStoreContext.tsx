import KPIStore from "../stores/KPIStore";
import { createStoreProvider } from "./BaseStoreContext";

export const {
  useStore: useKPIStore,
  StoreProvider: KPIStoreProvider,
} = createStoreProvider(KPIStore, "KPIStore");