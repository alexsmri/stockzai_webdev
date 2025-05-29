import { useEffect } from "react";
import type { CompanyAPIResponse } from "../types/types";
import CompanyStore from "../stores/CompanyStore";

export function useCompanyStoreSync(
    store: CompanyStore, 
    setData: React.Dispatch<React.SetStateAction<CompanyAPIResponse | null>>
) {

  useEffect(() => {
    const subscriber = () => {
      store.get().then(setData);
    };

    store.get(subscriber).then(setData);

    return () => store.unsubscribe(subscriber);
  }, [store])
}