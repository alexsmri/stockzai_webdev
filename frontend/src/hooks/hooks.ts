import { useEffect } from "react";
import type { CompanyAPIResponse, KPIAPIResponse, SearchAPIResponse } from "../types/types";
import CompanyStore from "../stores/CompanyStore";
import KPIStore from "../stores/KPIStore";
import SearchStore from "../stores/SearchStore";

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

export function useKPIStoreSync(
    store: KPIStore, 
    setData: React.Dispatch<React.SetStateAction<KPIAPIResponse | null>>
) {

  useEffect(() => {
    const subscriber = () => {
      store.get().then(setData);
    };

    store.get(subscriber).then(setData);

    return () => store.unsubscribe(subscriber);
  }, [store])
}

export function useSearchStoreSync(
    store: SearchStore, 
    setData: React.Dispatch<React.SetStateAction<SearchAPIResponse | null>>
) {

  useEffect(() => {
    const subscriber = () => {
      store.get().then(setData);
    };

    store.get(subscriber).then(setData);

    return () => store.unsubscribe(subscriber);
  }, [store])
}