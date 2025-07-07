import { useSearchStoreSync } from "../hooks/hooks";
import { useSearchStore } from "../context/CTX_SearchStore";
import { useState } from "react";
import type { VAI_SearchData } from "../types/interfaces";

const MAX_COMPLETIONS_SHOWN = 7

interface PRI_SearchCompletion {
  prQuery: string;
  onSelect: (value: string) => void;
}

function COM_SearchCompletion({ prQuery, onSelect }: PRI_SearchCompletion) {
  const store = useSearchStore();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useSearchStoreSync(store, setData);

  if (!data?.results) return null;

  const safeData = data as VAI_SearchData
  return (
    <>
      {(
      safeData.results && data.query === prQuery
      ) && (
        <div className="look-div-container">
        {Object.entries(safeData.results)
          .slice(0, MAX_COMPLETIONS_SHOWN)
          .map(([symbol, res]) => (
          <div
            key={symbol}
            onClick={() => onSelect(symbol)}
            className="area-flex-wrap hover-color mod-cursor-pointer"
          >
            <p className="mod-align-left">{symbol}</p>
            <p className="look-text-x0 mod-align-left">{res.name}</p>
          </div>
        ))}
        </div>
      )
        }
    </>
  );
}

export default COM_SearchCompletion;
