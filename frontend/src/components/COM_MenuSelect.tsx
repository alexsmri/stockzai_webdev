import { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export type MenuSelectOptions = Record<string, string>;

export type MenuSelectProps = {
  prOptions: MenuSelectOptions;
  prHandleChange: (key: string) => void;
};

type IndicatorState = {
  width: number;
  left: number;
};

export default function COM_MenuSelect({ prOptions, prHandleChange }: MenuSelectProps) {
  const entries = useMemo(() => Object.entries(prOptions), [prOptions]);
  const [selectedKey, setSelectedKey] = useState(() => entries[0]?.[0] ?? '');
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
    if (!entries.length) {
      setSelectedKey('');
      return;
    }

    if (!entries.some(([key]) => key === selectedKey)) {
      setSelectedKey(entries[0][0]);
    }
  }, [entries, selectedKey]);

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
    if (selectedKey) {
      prHandleChange(selectedKey);
    }
  }, [selectedKey, prHandleChange]);

  if (!entries.length) {
    return null;
  }

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
          className={`look-menu-select__option${selectedKey === key ? ' is-selected' : ''}`}
          onClick={() => setSelectedKey(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}