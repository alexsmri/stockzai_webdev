import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import COM_SearchBar from '../components/COM_SearchBar';
import COM_SearchCompletion from '../components/COM_SearchCompletion';
import COM_SearchResults from '../components/COM_SearchResults';
import STR_ApplicationPage from '../structures/STR_ApplicationPage';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { VAI_SearchData } from '../types/interfaces';

export default function PAG_Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useCompaniesStore();

  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [searchData, setSearchData] = useState<VAI_SearchData | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = (params.get('q') || '').trim();

    if (query) {
      setInput((prev) => (prev === query ? prev : query));
      setSubmittedQuery(query);
      setShowCompletions(false);
    } else {
      setSubmittedQuery('');
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
      <COM_SearchResults
        prRows={resultRows}
        prOnRowClick={(rowId) => handleRowClick(rowId)}
        prRedactedSymbols={searchData?.redacted ?? null}
        prHasLoadedResults={Boolean(searchData)}
      />
    </STR_ApplicationPage>
  );
}
