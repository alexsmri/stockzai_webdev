import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import COM_Loading from "../components/COM_Loading";

type StoreWithCreate<TStore, TArgs extends any[]> = {
  create: (...args: TArgs) => Promise<TStore>;
};

export function createStoreProvider<TStore, TArgs extends any[]>(
  StoreClass: StoreWithCreate<TStore, TArgs>,
  storeName: string
) {
  const StoreContext = createContext<TStore | null>(null);

  const useStore = (): TStore => {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error(`use${storeName} must be used within a ${storeName}Provider`);
    }
    return context;
  };

  const StoreProvider = ({
    args,
    children,
    fallback,
  }: {
    args: TArgs;
    children: ReactNode;
    fallback?: ReactNode;
  }) => {
    const [store, setStore] = useState<TStore | null>(null);
    useEffect(() => {
      StoreClass.create(...args).then(setStore);
    }, [...args]);
    

    if (!store) return <>{fallback ?? <COM_Loading />}</>;

    return (
      <StoreContext.Provider value={store}>
        {children}
      </StoreContext.Provider>
    );
  };

  return { useStore, StoreProvider };
}
