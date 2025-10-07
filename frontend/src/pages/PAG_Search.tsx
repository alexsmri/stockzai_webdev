import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import COM_ListView from '../components/COM_ListView';
import COM_SearchBar from '../components/COM_SearchBar';
import COM_SearchCompletion from '../components/COM_SearchCompletion';
import COM_Footer from '../components/COM_Footer';
import STR_ApplicationPage from '../structures/STR_ApplicationPage';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { VAI_SearchData, ITF_ListViewColumnConfig } from '../types/interfaces';

const SEARCH_RESULTS_COLUMNS: ITF_ListViewColumnConfig[] = [
  {
    id: 'symbol',
    title: 'Symbol',
    valueGetter: (_, rowId) => rowId,
    defaultSorting: 'a',
    cellClassName: 'look-text-x1 look-priority-high mod-text-wrap-gradient',
  },
  {
    id: 'name',
    title: 'Name',
    key: 'name',
    defaultSorting: 'a',
    fallback: 'Unknown Company',
    cellClassName: 'look-text-x1 look-priority-medium mod-text-wrap-gradient',
  },
  {
    id: 'sector',
    title: 'Sector',
    key: 'sector',
    defaultSorting: 'a',
    fallback: 'Unknown Sector',
    cellClassName: 'look-text-x1 look-priority-low mod-text-wrap-gradient',
  },
  {
    id: 'sectorRanking',
    title: 'Sector Rank',
    key: 'sectorRanking',
    defaultSorting: 'a',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
  },
  {
    id: 'financial_score',
    title: 'Financial Score',
    key: 'financial_score',
    defaultSorting: 'd',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
  },
  {
    id: 'valuation_score',
    title: 'Valuation Score',
    key: 'valuation_score',
    defaultSorting: 'd',
    isNumeric: true,
    fallback: '-',
    cellClassName: 'look-text-x1 look-priority-low',
  },
];

export default function PAG_Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useCompaniesStore();

  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [searchData, setSearchData] = useState<VAI_SearchData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = (params.get('q') || '').trim();

    if (query) {
      setInput((prev) => (prev === query ? prev : query));
      setSubmittedQuery(query);
      setShowResults(true);
      setShowCompletions(false);
    } else {
      setSubmittedQuery('');
      setShowResults(false);
    }
  }, [location.search]);

  const shouldFetchResults = submittedQuery.trim().length > 0;
  const searchPaths = useMemo<(string | number)[]>(
    () => (submittedQuery ? [submittedQuery] : []),
    [submittedQuery]
  );
  const searchParams = useMemo(() => ({ unique: false, variant: 'search' as const }), []);

  useCompaniesStoreSync<VAI_SearchData>(store, 'PropertySearchResults', setSearchData, {
    autoFetch: shouldFetchResults,
    prUrlPaths: searchPaths,
    prUrlParams: searchParams,
  });

  useEffect(() => {
    if (!shouldFetchResults) {
      setSearchData(null);
    }
  }, [shouldFetchResults]);

  const resultRows = useMemo(() => {
    if (!shouldFetchResults || !searchData?.results) {
      return [] as Array<[string, Record<string, unknown>]>;
    }
    return Object.entries(searchData.results);
  }, [searchData, shouldFetchResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) {
      return;
    }
    setShowCompletions(false);
    setSubmittedQuery(query);
    setShowResults(true);
    navigate(`/companies/search/?q=${query}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowCompletions(true);
  };

  const handleRowClick = (symbol: string) => {
    if (!symbol) {
      return;
    }
    navigate(`/companies/page/${symbol}`);
  };

  return (
    <STR_ApplicationPage>
      <div className="area-flex-row mod-postion-relative mod-padding-side">
        <COM_SearchBar
          input={input ?? ''}
          submit={true}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
        {input && showCompletions && (
          <div className="area-completions">
            <COM_SearchCompletion
              onSelect={(val) => {
                navigate(`/companies/page/${val}`);
              }}
              prQuery={input}
              prUnique={input.length <= 2}
            />
          </div>
        )}
      </div>
      {showResults && (
        <COM_ListView
          prRows={resultRows}
          prColumnConfig={SEARCH_RESULTS_COLUMNS}
          prOnRowClick={(rowId) => handleRowClick(rowId)}
        />
      )}
      <COM_Footer />
    </STR_ApplicationPage>
  );
}
