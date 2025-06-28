import STO_Search from "../stores/STO_Search";
import { createStoreProvider } from "./CTX_BaseStore";

export const {
  useStore: useSearchStore,
  StoreProvider: PRV_SearchStore,
} = createStoreProvider(STO_Search, "SearchStore");