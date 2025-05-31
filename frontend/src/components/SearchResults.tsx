import { useSearchStoreSync } from "../hooks/hooks";
import { useSearchStore } from "../context/SearchStoreContext";
import type { SearchAPIResponse } from "../types/types";
import { useState } from "react";

function SearchResults() {
  const store = useSearchStore();
  const [data, setData] = useState<SearchAPIResponse | null>(null);

  useSearchStoreSync(store, setData);
  return (
    <>
     {data && Object.entries(data).map(([symbol, value]) => (
        <div key={symbol}>
            <p>{symbol}</p>
            <p>{value.name}</p>
        </div>
     ))}
    </>
  );
}

export default SearchResults;
