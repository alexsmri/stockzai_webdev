import SearchStore from "../stores/SearchStore";
import { createStoreProvider } from "./BaseStoreContext";

export const {
  useStore: useSearchStore,
  StoreProvider: SearchStoreProvider,
} = createStoreProvider(SearchStore, "SearchStore");