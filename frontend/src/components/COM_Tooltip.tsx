import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import COM_IconColor from './COM_IconColor';

const INFO_COLOR = 'rgba(255, 255, 255, 0.4)';
const DEFAULT_MARGIN = 12;

interface PRI_Tooltip {
  prContent: ReactNode;
  prOffset?: number;
  prAlignment?: 'center' | 'start' | 'end';
  prLabel?: string;
}

function isEventInside(target: EventTarget | null, container: HTMLElement | null): boolean {
  if (!(target instanceof Node) || !container) {
    return false;
  }
  return container.contains(target);
}

export default function COM_Tooltip({
  prContent,
  prOffset = 8,
  prAlignment = 'center',
  prLabel = 'More information',
}: PRI_Tooltip) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsTouchDevice(event.matches);
    };
    handleChange(mediaQuery);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) {
      return;
    }
    const anchorRect = anchor.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left: number;
    if (prAlignment === 'start') {
      left = anchorRect.left;
    } else if (prAlignment === 'end') {
      left = anchorRect.right - tooltipRect.width;
    } else {
      left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
    }
    const top = anchorRect.bottom + prOffset;
    const maxLeft = window.innerWidth - tooltipRect.width - DEFAULT_MARGIN;
    const maxTop = window.innerHeight - tooltipRect.height - DEFAULT_MARGIN;
    setStyle({
      left: Math.max(DEFAULT_MARGIN, Math.min(left, maxLeft)),
      top: Math.max(DEFAULT_MARGIN, Math.min(top, maxTop)),
    });
  }, [prAlignment, prOffset]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    updatePosition();
    const handleWindowUpdate = () => updatePosition();
    window.addEventListener('resize', handleWindowUpdate);
    window.addEventListener('scroll', handleWindowUpdate, true);
    return () => {
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen || !isTouchDevice) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const anchor = anchorRef.current;
      const tooltip = tooltipRef.current;
      if (isEventInside(event.target, anchor) || isEventInside(event.target, tooltip)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, isTouchDevice]);

  const eventHandlers = useMemo(() => {
    if (isTouchDevice) {
      return {
        onClick: () => setIsOpen((previous) => !previous),
      };
    }
    return {
      onMouseEnter: () => setIsOpen(true),
      onMouseLeave: () => setIsOpen(false),
      onFocus: () => setIsOpen(true),
      onBlur: () => setIsOpen(false),
    };
  }, [isTouchDevice]);

  return (
    <>
      <button
        type="button"
        aria-label={prLabel}
        aria-expanded={isOpen}
        ref={anchorRef}
        className="mod-cursor-pointer"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...eventHandlers}
      >
        <COM_IconColor
          prColor={INFO_COLOR}
          prPath="ICON_Info"
          prWidth="1.25rem"
          prHeight="1.25rem"
        />
      </button>
      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="look-div-solid mod-padding-s"
          style={{
            backgroundColor: 'var(--color-primary)',
            position: 'fixed',
            zIndex: 1,
            maxWidth: '18rem',
            ...style,
          }}
        >
          {prContent}
        </div>
      )}
    </>
  );
}
