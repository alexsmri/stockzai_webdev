import { useEffect } from "react";
import type { CompanyAPIResponse, KPIAPIResponse, SearchAPIResponse } from "../types/types";
import STO_Companies from "../stores/STO_Companies";
import STO_KPI from "../stores/STO_KPI";
import STO_Search from "../stores/STO_Search";
import type STO_Users from "../stores/STO_Users";
import type { ValidKeys } from "../stores/STO_Users";

export function useCompanyStoreSync(
    store: STO_Companies, 
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
    store: STO_KPI, 
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
    store: STO_Search, 
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

export function useUserStoreSync(
    store: STO_Users, 
    key: ValidKeys,
    setData: React.Dispatch<React.SetStateAction<any | null>>
) {
  useEffect(() => {
    const subscriber = () => {
      setData(store.read(key));
    };
    store.subscribe(key, subscriber)

    return () => store.unsubscribe(key, subscriber);
  }, [store])
}