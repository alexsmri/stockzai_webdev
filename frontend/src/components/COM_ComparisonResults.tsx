import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { useEffect, useState } from 'react';

interface ComparisonEntry {
  name?: string;
  sector?: string;
  financial_score?: number;
  valuation_score?: number;
  sectorRanking?: number;
  priceChange?: number;
  totalScore?: number;
  [key: string]: unknown;
}

interface SearchResponsePayload {
  results?: Record<string, ComparisonEntry>;
  query?: string;
  [key: string]: unknown;
}

interface PRI_ComparisonResults {
  submittedQuery: string;
  submitIndex: number;
}

export default function COM_ComparisonResults({
  submittedQuery,
  submitIndex,
}: PRI_ComparisonResults) {
  const store = useCompaniesStore();
  const [resultData, setResultData] = useState<SearchResponsePayload | null>(null);
  const [results, setResults] = useState<Record<string, ComparisonEntry>[]>([]);
  const [cachedResult, setCachedResult] = useState<Record<string, ComparisonEntry> | null>(null);

  useEffect(() => {
    if (!submittedQuery.trim()) {
      setResultData(null);
    }
  }, [submittedQuery]);

  useCompaniesStoreSync<SearchResponsePayload>(store, 'PropertySearchComparison', setResultData, {
    autoFetch: submittedQuery.trim().length > 0,
    prUrlPaths: submittedQuery ? [submittedQuery] : [],
    prUrlParams: { unique: true, variant: 'search' },
  });

  useEffect(() => {
    if (resultData?.results) {
      setResults((prev) => {
        const symbol = Object.keys(resultData.results as Record<string, ComparisonEntry>)[0];
        if (prev.some((r) => Object.keys(r)[0] === symbol)) return prev;
        return [...prev, resultData.results as Record<string, ComparisonEntry>];
      });
    }
  }, [resultData]);

  useEffect(() => {
    if (cachedResult && Object.keys(cachedResult)[0] === submittedQuery) {
      setResults((prev) => {
        const symbol = Object.keys(cachedResult)[0];
        if (prev.some((r) => Object.keys(r)[0] === symbol)) return prev;
        return [...prev, cachedResult];
      });
    }
  }, [cachedResult, submittedQuery, submitIndex]);

  const handleClose = (symbol: string) => {
    const match = results.find((res) => Object.keys(res)[0] === symbol);
    setCachedResult(match ?? null);
    setResults((prev) => prev.filter((r) => !Object.prototype.hasOwnProperty.call(r, symbol)));
  };

  return (
    <>
      {results.map((result, index) =>
        Object.entries(result).map(([key, value]) => (
          <div
            key={`${index}-${key}`}
            className="area-grid-comparison mod-wh-full"
          >
            <a className="look-button-ghost" onClick={() => handleClose(key)}>-</a>
            <p className="text-green-400">{key}</p>
            <p>{value.name ?? '--'}</p>
            <p>{value.sector ?? '--'}</p>
            <p>{value.financial_score ?? '--'}</p>
            <p>{value.valuation_score ?? '--'}</p>
            <p>{value.sectorRanking ?? '--'}</p>
          </div>
        ))
      )}
    </>
  );
}
