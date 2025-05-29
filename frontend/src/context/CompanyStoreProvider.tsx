import { createContext, useContext } from "react";
import { useState, useEffect } from "react";
import CompanyStore from "../stores/CompanyStore";

export const CompanyStoreContext = createContext<CompanyStore | null>(null);

export const useCompanyStore = () => {
  const context = useContext(CompanyStoreContext);
  if (!context) {
    throw new Error("useCompanyStore must be used within a CompanyProvider");
  }
  return context;
};

interface CompanyProviderProps {
  symbol: string;
  children: React.ReactNode;
}

export const CompanyStoreProvider = ({
  symbol,
  children,
}: CompanyProviderProps) => {
  const [store, setStore] = useState<CompanyStore | null>(null);

  useEffect(() => {
    const loadStore = async () => {
      const instance = await CompanyStore.create(symbol);
      setStore(instance);
    };

    if (symbol) loadStore();
  }, [symbol]);

  if (!store) return <div>Loading company data...</div>;

  return (
    <CompanyStoreContext.Provider value={store}>
      {children}
    </CompanyStoreContext.Provider>
  );
};
