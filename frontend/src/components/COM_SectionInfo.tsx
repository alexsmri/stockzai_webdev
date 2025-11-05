import { Children, useEffect, useMemo, useState, type ReactNode } from 'react';
import COM_IndicatorChange from './COM_IndicatorChange';
import COM_MenuSelect from './COM_MenuSelect';

const ROLE_CHANGE_KPIS: Record<string, string> = {
  'Scores.': 'totalScore',
};

const MENU_CLASS = 'area-flex-col mod-align-stretch mod-padding-none';
const NO_MENU_CLASS = 'area-flex-wrap mod-space-around mod-gap-l mod-flex-grow-children mod-center';

interface InfoSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  prShowChange?: boolean;
  prMenuOptions?: Record<string, string>;
  prHeaderAddon?: ReactNode;
}

function COM_SectionInfo({
  title,
  subtitle,
  children,
  prShowChange,
  prMenuOptions,
  prHeaderAddon,
}: InfoSectionProps) {
  const shouldShowChange = prShowChange ? true : false;

  const menuEntries = useMemo(() => {
    if (!prMenuOptions) {
      return undefined;
    }
    const entries = Object.entries(prMenuOptions);
    return entries.length ? entries : undefined;
  }, [prMenuOptions]);

  const [selectedKey, setSelectedKey] = useState<string | null>(
    () => menuEntries?.[0]?.[0] ?? null
  );

  useEffect(() => {
    if (!menuEntries) {
      if (selectedKey !== null) {
        setSelectedKey(null);
      }
      return;
    }

    if (!selectedKey || !menuEntries.some(([key]) => key === selectedKey)) {
      setSelectedKey(menuEntries[0][0]);
    }
  }, [menuEntries, selectedKey]);

  const childArray = useMemo(
    () =>
      Children.toArray(children).filter((child) => {
        if (typeof child === 'string') {
          return child.trim().length > 0;
        }
        return true;
      }),
    [children]
  );

  const renderedContent = useMemo(() => {
    if (!menuEntries || !menuEntries.length) {
      return children;
    }

    if (!selectedKey) {
      return childArray[0] ?? null;
    }

    const selectedIndex = menuEntries.findIndex(([key]) => key === selectedKey);
    if (selectedIndex === -1) {
      return childArray[0] ?? null;
    }

    return childArray[selectedIndex] ?? null;
  }, [menuEntries, selectedKey, childArray, children]);

  const handleMenuChange = (key: string) => {
    if (key !== selectedKey) {
      setSelectedKey(key);
    }
  };

  const showControlArea = Boolean((menuEntries && prMenuOptions) || (shouldShowChange && title));
  const showHeaderAddon = Boolean(prHeaderAddon);
  const shouldRenderControls = showControlArea || showHeaderAddon;

  return (
    <div className="area-flex-col mod-align-stretch look-div-subtle">
      <div className="area-flex-row mod-space-between">
        {title && (
          <h3 className="look-text-x0 look-text-subtle" style={{ marginRight: 'auto' }}>
            {title}
          </h3>
        )}
        {shouldRenderControls && (
          <div className="area-flex-row mod-gap-s mod-padding-none">
            {menuEntries && prMenuOptions && (
              <COM_MenuSelect prOptions={prMenuOptions} prHandleChange={handleMenuChange} />
            )}
            {shouldShowChange && title && (
              <COM_IndicatorChange prKPI={ROLE_CHANGE_KPIS[title]} prShowDiv={true} />
            )}
            {prHeaderAddon}
          </div>
        )}
      </div>
      {subtitle && <p>{subtitle}</p>}
      <div className={prMenuOptions ? MENU_CLASS : NO_MENU_CLASS}>{renderedContent}</div>
    </div>
  );
}

export default COM_SectionInfo;
