import UserStore from "../stores/UserStore";
import { createStoreProvider } from "./BaseStoreContext";

export const {
  useStore: useUserStore,
  StoreProvider: UserStoreProvider,
} = createStoreProvider(UserStore, "UserStore");