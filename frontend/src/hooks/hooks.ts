import { useEffect, useMemo, useState, type Dispatch, type SetStateAction, type RefObject } from "react";
import type STO_Companies from "../stores/STO_Companies";
import type { ValidKeys as CompanyStoreKeys } from "../stores/STO_Companies";
import type STO_Users from "../stores/STO_Users";
import type { ValidKeys as UserStoreKeys } from "../stores/STO_Users";
import type { StoreStatus } from "../stores/STO_Base";

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
  const { autoFetch = false } = options;
  useEffect(() => {
    const readValue = () => store.read(key) as TData | null | undefined;
    const subscriber = () => {
      const nextValue = readValue();
      setData(nextValue ?? null);
    };

    const unsubscribe = store.subscribe(key, subscriber);
    subscriber();

    if (autoFetch) {
      const status = store.getStatus(key) as StoreStatus | undefined;
      const currentValue = readValue();
      const hasValue = currentValue !== null && currentValue !== undefined;
      const shouldFetch = status !== "loading" && (status !== "success" || !hasValue);
      if (shouldFetch) {
        void store.get(key).catch((error: unknown) => {
          console.warn("autoFetch in useUserStoreSync failed", error);
        });
      }
    }

    return unsubscribe;
  }, [store, key, autoFetch, setData]);
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

// Flips to true the first time the referenced element scrolls into view (and stays true).
export function useInViewOnce(ref: RefObject<Element | null>, threshold = 0.3) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, inView]);

  return inView;
}

export interface ITF_TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Builds a table of contents from the headings inside `ref` (ids are generated where missing)
// and tracks which heading the reader is currently at. Re-runs when `contentKey` changes.
export function useDocToc(
  ref: RefObject<HTMLElement | null>,
  contentKey: string,
  selector = 'h2, h3',
  offset = 140
) {
  const [items, setItems] = useState<ITF_TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const usedIds = new Set<string>();
    const nextItems = headings.map((heading) => {
      const text = heading.textContent?.trim() ?? '';
      const base = slugify(text) || 'section';
      let id = heading.id || base;
      let counter = 2;
      while (usedIds.has(id)) {
        id = `${base}-${counter++}`;
      }
      usedIds.add(id);
      heading.id = id;
      return { id, text, level: Number(heading.tagName.slice(1)) };
    });
    setItems(nextItems);
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0].id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= offset) current = heading.id;
        else break;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActiveId(atBottom ? headings[headings.length - 1].id : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, contentKey, selector, offset]);

  return { items, activeId };
}

// Adds `revealedClass` to every element matching `selector` inside `ref` the first time it
// scrolls into view (scroll-triggered entrance animations; the animation itself lives in CSS).
export function useRevealOnScroll(
  ref: RefObject<HTMLElement | null>,
  selector = '.lp-reveal',
  revealedClass = 'lp-reveal-in'
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((target) => target.classList.add(revealedClass));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(revealedClass);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [ref, selector, revealedClass]);
}
