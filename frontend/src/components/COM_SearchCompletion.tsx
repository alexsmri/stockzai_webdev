import { useSearchStoreSync } from '../hooks/hooks';
import { useSearchStore } from '../context/CTX_SearchStore';
import { useState } from 'react';
import type { VAI_SearchData } from '../types/interfaces';

const MAX_COMPLETIONS_SHOWN = 7;

interface PRI_SearchCompletion {
  prQuery: string;
  onSelect: (value: string) => void;
}

function COM_SearchCompletion({ prQuery, onSelect }: PRI_SearchCompletion) {
  const store = useSearchStore();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useSearchStoreSync(store, setData);

  if (!data?.results) {
    return null;
  }

  const safeData = data as VAI_SearchData;
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
