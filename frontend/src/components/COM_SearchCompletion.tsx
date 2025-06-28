import { useSearchStoreSync } from "../hooks/hooks";
import { useSearchStore } from "../context/CTX_SearchStore";
import type { SearchAPIResponse } from "../types/types";
import { useState } from "react";

interface SearchCompletionProps {
  onSelect: (value: string) => void;
}

function COM_SearchCompletion({ onSelect }: SearchCompletionProps) {
  const store = useSearchStore();
  const [data, setData] = useState<SearchAPIResponse | null>(null);

  useSearchStoreSync(store, setData);

  if (!data) return null;

  return (
    <>
      {data &&
        <div className="look-div-container">
        {Object.entries(data).map(([symbol, res]) => (
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
        }
        
    </>
  );
}

export default COM_SearchCompletion;
