import { useEffect, useState } from "react";
import type { APIResponse } from "../types/types";
import STO_Companies from "../stores/STO_Companies";
import STO_KPI from "../stores/STO_KPI";
import STO_Search from "../stores/STO_Search";
import type STO_Users from "../stores/STO_Users";
import type { ValidKeys } from "../stores/STO_Users";
import STO_Winners from "../stores/STO_Winners";

export function useCompanyStoreSync(
    store: STO_Companies, 
    setData: React.Dispatch<React.SetStateAction<APIResponse | null>>
) {

  useEffect(() => {
    const subscriber = () => {
      store.get().then(setData);
    };

    store.subscribe(subscriber)
    store.get().then(setData);
  }, [store])
}

export function useKPIStoreSync(
    store: STO_KPI, 
    setData: React.Dispatch<React.SetStateAction<APIResponse | null>>
) {

  useEffect(() => {
    const subscriber = () => {
      store.get().then(setData);
    };

    store.subscribe(subscriber)
    store.get().then(setData);

    return () => store.unsubscribe(subscriber);
  }, [store])
}

export function useSearchStoreSync(
    store: STO_Search, 
    setData: React.Dispatch<React.SetStateAction<APIResponse | null>>
) {

  useEffect(() => {
    const subscriber = () => {
      store.get().then(setData);
    };

    store.subscribe(subscriber)
    store.get().then(setData);

    return () => store.unsubscribe(subscriber);
  }, [store])
}

export function useWinnerStoreSync(
    store: STO_Winners, 
    setData: React.Dispatch<React.SetStateAction<APIResponse | null>>
) {

  useEffect(() => {
    const subscriber = () => {
      store.get().then(setData);
    };

    store.subscribe(subscriber)
    store.get().then(setData);
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

function getWindowDimensions() {
  const {innerWidth: width, innerHeight: height} = window;
  return {

    width,
    height
  };
}
export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  return windowDimensions;
}

export function useStickyObserver(ref: React.RefObject<HTMLElement | null>, sentinelID: string, stickingClass = "is-sticking") {
  useEffect(() => {
    const sentinel = document.getElementById(sentinelID)
    const el = ref.current;
    if (!sentinel || !el) return;

    const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.boundingClientRect.y < 0 || !entry.isIntersecting) {
        el.classList.add(stickingClass);
      } else {
        el.classList.remove(stickingClass);
      }
    },
    { threshold: [0] }
  );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [ref, stickingClass]);
}