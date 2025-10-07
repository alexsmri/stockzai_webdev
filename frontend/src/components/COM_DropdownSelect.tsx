import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import ICON_Triangle from '@/assets/media/ICON_Triangle.svg?react';

export type TYP_DropdownOption = {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export type TYP_DropdownConfig = Record<string, TYP_DropdownOption>;

export interface PI_DropdownSelect {
  prDropdownConfig: TYP_DropdownConfig;
  handleSelect: (key: string) => void;
  prSelectedKey?: string;
  prPlaceholder?: string;
}

export default function COM_DropdownSelect({
  prDropdownConfig,
  handleSelect,
  prSelectedKey,
  prPlaceholder = 'Select an option',
}: PI_DropdownSelect) {
  const entries = useMemo(() => Object.entries(prDropdownConfig), [prDropdownConfig]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>(() => prSelectedKey ?? entries[0]?.[0] ?? '');

  useEffect(() => {
    if (prSelectedKey !== undefined) {
      setActiveKey(prSelectedKey);
      return;
    }

    if (!entries.length) {
      setActiveKey('');
      return;
    }

    if (!entries.some(([key]) => key === activeKey)) {
      setActiveKey(entries[0][0]);
    }
  }, [prSelectedKey, entries, activeKey]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }
      const target = event.target as Node | null;
      if (target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!entries.length) {
    return null;
  }

  const activeOption = entries.find(([key]) => key === activeKey)?.[1];
  const buttonLabel = activeOption?.label ?? prPlaceholder;

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const selectOption = (key: string) => {
    setActiveKey(key);
    setIsOpen(false);
    handleSelect(key);
  };

  return (
    <div className="mod-postion-relative" ref={containerRef}>
      <button type="button" className="look-button-tertiary area-flex-row" onClick={toggleDropdown}>
        <span className="look-text-x1 look-text-normal">{buttonLabel}</span>
        <ICON_Triangle
          style={{
            width: 'calc(var(--default-font-size) * 1)',
            height: 'auto',
            transform: isOpen ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>
      {isOpen && (
        //style={{ maxWidth: buttonWidth }}
        <div className="area-completions" role="listbox">
          {entries.map(([key, option]) => {
            const Icon = option.icon;

            return (
              <button
                type="button"
                key={key}
                className="look-button-ghost"
                onClick={() => selectOption(key)}
              >
                {Icon && <Icon style={{ width: 'calc(var(--default-font-size) * 1)' }} />}
                <span className="look-text-x1 look-text-subtle">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
