import { useEffect, useMemo, useState, type Dispatch, type SetStateAction, type RefObject } from "react";
import type STO_Companies from "../stores/STO_Companies";
import type { ValidKeys as CompanyStoreKeys } from "../stores/STO_Companies";
import type STO_Users from "../stores/STO_Users";
import type { ValidKeys as UserStoreKeys } from "../stores/STO_Users";

interface ITF_CompaniesSyncOptions {
  autoFetch?: boolean;
  prUrlPaths?: (string | number)[];
  prUrlParams?: Record<string, unknown>;
}

interface ITF_UserSyncOptions {
  autoFetch?: boolean;
}

export function useCompaniesStoreSync<TData = Record<string, unknown>>(
  store: STO_Companies,
  key: CompanyStoreKeys,
  setData: Dispatch<SetStateAction<TData | null>>,
  options: ITF_CompaniesSyncOptions = {}
) {
  const { autoFetch = false, prUrlPaths = [], prUrlParams = {} } = options;
  const serializedPaths = useMemo(() => JSON.stringify(prUrlPaths), [prUrlPaths]);
  const serializedParams = useMemo(() => JSON.stringify(prUrlParams), [prUrlParams]);

  useEffect(() => {
    const subscriber = () => {
      const nextValue = store.read(key) as TData | null | undefined;
      setData(nextValue ?? null);
    };

    const unsubscribe = store.subscribe(key, subscriber);
    subscriber();

    if (autoFetch) {
      void store.get(key, prUrlPaths, prUrlParams);
    }

    return unsubscribe;
  }, [store, key, autoFetch, serializedPaths, serializedParams]);
}

export function useUserStoreSync<TData = Record<string, unknown>>(
  store: STO_Users,
  key: UserStoreKeys,
  setData: Dispatch<SetStateAction<any | null>>,
  options: ITF_UserSyncOptions = {}
) {
  const { autoFetch = false, } = options;
  useEffect(() => {
    const subscriber = () => {
      const nextValue = store.read(key) as TData | null | undefined;
      setData((nextValue ?? null));
    };

    const unsubscribe = store.subscribe(key, subscriber);
    subscriber();

    if (autoFetch) {
      try {
        void store.get(key);
      } catch {
        console.warn("autoFetch in useUserStoreSynch failed")
      }
    }

    return unsubscribe;
  }, [store, key, autoFetch]);
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export function useStickyObserver(
  ref: RefObject<HTMLElement | null>,
  sentinelID: string,
  stickingClass = "is-sticking"
) {
  useEffect(() => {
    const sentinel = document.getElementById(sentinelID);
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
  }, [ref, stickingClass, sentinelID]);
}
