import { useSearchStore } from "../context/CTX_SearchStore";
import { useSearchStoreSync } from "../hooks/hooks";
import { useEffect, useState } from "react";

interface ComparisonResultsProps {
  submittedQuery: string;
  submitIndex: number;
}

export default function COM_ComparisonResults({
  submittedQuery,
  submitIndex,
}: ComparisonResultsProps) {
  const store = useSearchStore();
  const [resultData, setResultData] = useState<Record<string, any> | null>(null);
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const [cachedResult, setCachedResult] = useState<Record<string, any> | null>(
    null
  );

  useEffect(() => {
    if (resultData && resultData.results) {
      setResults((prev) => {
        const symbol = Object.keys(resultData.results)[0];
        if (prev.some((r) => Object.keys(r)[0] === symbol)) return prev;
        return [...prev, resultData.results];
      });
    }
  }, [resultData]);

  useEffect(() => {
    if (cachedResult && Object.keys(cachedResult)[0] === submittedQuery)
      setResults((prev) => {
        const symbol = Object.keys(cachedResult)[0];
        if (prev.some((r) => Object.keys(r)[0] === symbol)) return prev;
        return [...prev, cachedResult];
      })
  }, [submitIndex]);

  const handleClose = (symbol: string) => {
    const match = results.find((res) => Object.keys(res)[0] === symbol);
    setCachedResult(match ?? null);
    setResults((prev) => prev.filter((r) => !r.hasOwnProperty(symbol)));
  };

  useSearchStoreSync(store, setResultData);

  return (
    <>
      {results.map((result, index) =>
        Object.entries(result).map(([key, value]) => (
          <div
            key={`${index}-${key}`}
            className="area-grid-comparison mod-wh-full"
          >
            <a className="look-button-ghost" onClick={() => handleClose(key)}>×</a>
            <p className="text-green-400">{key}</p>
            <p>{value.name ?? "--"}</p>
            <p>{value.sector ?? "--"}</p>
            <p>{value.financial_score ?? "--"}</p>
            <p>{value.valuation_score ?? "--"}</p>
            <p>{value.sectorRanking ?? "--"}</p>
          </div>
        ))
      )}
    </>
  );
}
