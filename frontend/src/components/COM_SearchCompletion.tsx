import { useEffect, useState } from 'react';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { VAI_SearchData } from '../types/interfaces';

const MAX_COMPLETIONS_SHOWN = 7;

interface PRI_SearchCompletion {
  prQuery: string;
  prUnique: boolean;
  onSelect: (value: string) => void;
}

function COM_SearchCompletion({ prQuery, prUnique, onSelect }: PRI_SearchCompletion) {
  const store = useCompaniesStore();
  const [data, setData] = useState<VAI_SearchData | null>(null);

  useEffect(() => {
    if (!prQuery.trim()) {
      setData(null);
    }
  }, [prQuery]);

  useCompaniesStoreSync<VAI_SearchData>(store, 'PropertySearchCompletion', setData, {
    autoFetch: prQuery.trim().length > 0,
    prUrlPaths: prQuery ? [prQuery] : [],
    prUrlParams: { unique: prUnique, variant: 'completion' },
  });

  if (!data?.results) {
    return null;
  }

  const safeData = data;
  const shouldShow = safeData.results && data.query === prQuery;

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {Object.entries(safeData.results)
        .slice(0, MAX_COMPLETIONS_SHOWN)
        .map(([symbol, res]) => {
          const companyName =
            typeof res?.name === 'string' && res.name.trim().length > 0
              ? res.name
              : 'Unknown Company';

          return (
            <button
              type="button"
              key={symbol}
              onClick={() => onSelect(symbol)}
              className="look-button-ghost"
            >
              <span className="look-text-x1 look-text-normal">{symbol}</span>
              <span className="look-text-x1 look-text-subtle mod-text-ellipsis" title={companyName}>
                {companyName}
              </span>
            </button>
          );
        })}
    </>
  );
}

export default COM_SearchCompletion;
