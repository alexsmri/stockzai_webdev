import type { SearchAPIResponse } from "../types/types";
import { useSearchStore } from "../context/SearchStoreContext";
import { useSearchStoreSync } from "../hooks/hooks";
import { useEffect, useState } from "react";

interface ComparisonResultsProps {
  submittedQuery: string;
  submitIndex: number;
}

export default function ComparisonResults({
  submittedQuery,
  submitIndex,
}: ComparisonResultsProps) {
  const store = useSearchStore();
  const [result, setResult] = useState<SearchAPIResponse | null>(null);
  const [results, setResults] = useState<SearchAPIResponse[]>([]);
  const [cachedResult, setCachedResult] = useState<SearchAPIResponse | null>(
    null
  );

  useEffect(() => {
    if (result) {
      setResults((prev) => {
        const symbol = Object.keys(result)[0];
        if (prev.some((r) => Object.keys(r)[0] === symbol)) return prev;
        return [...prev, result];
      });
    }
  }, [result]);

  useEffect(() => {
    if (cachedResult && Object.keys(cachedResult)[0] === submittedQuery)
      setResults((prev) => [...prev, cachedResult]);
  }, [submitIndex]);

  const handleClose = (symbol: string) => {
    const match = results.find((res) => Object.keys(res)[0] === symbol);
    setCachedResult(match ?? null);
    setResults((prev) => prev.filter((r) => !r.hasOwnProperty(symbol)));
  };

  useSearchStoreSync(store, setResult);

  return (
    <>
      {results.map((result, index) =>
        Object.entries(result).map(([key, value]) => (
          <div
            key={`${index}-${key}`}
            className="grid grid-cols-[5%_15%_auto_20%_20%] p-[0.4vw] text-center"
          >
            <button onClick={() => handleClose(key)}>×</button>
            <p className="text-green-400">{key}</p>
            <p>{value.name}</p>
            <p>{value.financial_score}</p>
            <p>{value.valuation_score}</p>
          </div>
        ))
      )}
    </>
  );
}
