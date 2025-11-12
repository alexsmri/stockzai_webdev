import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export type MenuSelectOptions = Record<string, string>;

export type MenuSelectProps = {
  prOptions: MenuSelectOptions;
  prHandleChange: (key: string) => void;
  prSelectedKey?: string;
};

type IndicatorState = {
  width: number;
  left: number;
};

export default function COM_MenuSelect({
  prOptions,
  prHandleChange,
  prSelectedKey,
}: MenuSelectProps) {
  const entries = useMemo(() => Object.entries(prOptions), [prOptions]);
  const isControlled = prSelectedKey !== undefined;
  const [internalKey, setInternalKey] = useState(() => prSelectedKey ?? entries[0]?.[0] ?? '');
  const selectedKey = isControlled ? prSelectedKey ?? '' : internalKey;
  const [indicator, setIndicator] = useState<IndicatorState>({ width: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const assignRef = useCallback((key: string, node: HTMLButtonElement | null) => {
    if (node) {
      itemRefs.current[key] = node;
    } else {
      delete itemRefs.current[key];
    }
  }, []);

  useEffect(() => {
    if (isControlled) {
      return;
    }

    if (!entries.length) {
      setInternalKey('');
      return;
    }

    if (!entries.some(([key]) => key === internalKey)) {
      setInternalKey(entries[0][0]);
    }
  }, [entries, internalKey, isControlled]);

  useEffect(() => {
    if (!isControlled || prSelectedKey === undefined) {
      return;
    }

    if (prSelectedKey && !entries.some(([key]) => key === prSelectedKey)) {
      return;
    }

    setInternalKey((prev) => (prev === prSelectedKey ? prev : prSelectedKey));
  }, [entries, isControlled, prSelectedKey]);

  const updateIndicator = useCallback(() => {
    if (!selectedKey) {
      setIndicator((prev) => (prev.width === 0 && prev.left === 0 ? prev : { width: 0, left: 0 }));
      return;
    }

    const target = itemRefs.current[selectedKey];
    const container = containerRef.current;

    if (!target || !container) {
      setIndicator((prev) => (prev.width === 0 && prev.left === 0 ? prev : { width: 0, left: 0 }));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const nextWidth = targetRect.width;
    const nextLeft = targetRect.left - containerRect.left;

    setIndicator((prev) => {
      if (prev.width === nextWidth && prev.left === nextLeft) {
        return prev;
      }

      return { width: nextWidth, left: nextLeft };
    });
  }, [selectedKey]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, entries]);

  useEffect(() => {
    updateIndicator();

    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator, entries.length]);

  useEffect(() => {
    if (isControlled) {
      return;
    }
    if (selectedKey) {
      prHandleChange(selectedKey);
    }
  }, [isControlled, selectedKey, prHandleChange]);

  if (!entries.length) {
    return null;
  }

  const handleSelect = (key: string) => {
    if (isControlled) {
      prHandleChange(key);
    } else {
      setInternalKey(key);
    }
  };

  const indicatorStyle: CSSProperties = {
    width: indicator.width,
    transform: `translateX(${indicator.left}px)`,
    opacity: indicator.width > 0 ? 1 : 0,
  };

  return (
    <div className="look-menu-select" ref={containerRef}>
      <div className="look-menu-select__indicator" style={indicatorStyle} />
      {entries.map(([key, label]) => (
        <button
          key={key}
          ref={(node) => assignRef(key, node)}
          type="button"
          className={`look-text-clickable${selectedKey === key ? ' mod-selected' : ''}`}
          onClick={() => handleSelect(key)}
        >
          <span
            className={`look-text-clickable mod-padding-none ${
              selectedKey === key ? ' mod-selected' : ''
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
