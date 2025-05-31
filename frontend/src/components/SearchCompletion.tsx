import { useSearchStoreSync } from "../hooks/hooks";
import { useSearchStore } from "../context/SearchStoreContext";
import type { SearchAPIResponse } from "../types/types";
import { useState } from "react";

interface SearchCompletionProps {
  onSelect: (value: string) => void;
}

function SearchCompletion({ onSelect }: SearchCompletionProps) {
  const store = useSearchStore();
  const [data, setData] = useState<SearchAPIResponse | null>(null);

  useSearchStoreSync(store, setData);

  if (!data) return null;

  return (
    <>
     {data && Object.entries(data).map(([symbol, res]) => (
        <div key={symbol} onClick={() => onSelect(symbol)}>
            <p>{symbol}</p>
            <p>{res.name}</p>
        </div>
     ))}
    </>
  );
}

export default SearchCompletion;
