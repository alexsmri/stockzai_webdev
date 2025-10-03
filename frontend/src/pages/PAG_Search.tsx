import { PRV_SearchStore } from '../context/CTX_SearchStore';
import { useEffect, useState } from 'react';
import COM_SearchBar from '../components/COM_SearchBar';
import COM_SearchResults from '../components/COM_SearchResults';
import { useLocation, useNavigate } from 'react-router-dom';
import COM_SearchCompletion from '../components/COM_SearchCompletion';
import COM_Sidebar from '../components/COM_Sidebar';
import COM_Footer from '../components/COM_Footer';
import COM_Breadcrumbs from '../components/COM_Breadcrumbs';

export default function PAG_Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const utStoreArgs = [input, input.length <= 2, 'completion'] as [string, boolean, string];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) {
      return;
    }
    setShowCompletions(false);
    setSubmittedQuery(query);
    setShowResults(true);
    navigate({ pathname: '/companies/search', search: `?q=${encodeURIComponent(query)}` }, { replace: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowCompletions(true);
  };

  return (
    <div
      className="area-flex-row mod-gap-none mod-padding-none"
      style={{ minHeight: '100vh', alignItems: 'stretch' }}
    >
      <COM_Sidebar />
      <div
        className="area-flex-col mod-gap-l mod-padding-hero mod-align-left"
        style={{ flex: 1, width: '100%' }}
      >
        <COM_Breadcrumbs />
        <h1 className="look-text-x7 mod-align-left">Search Ticker</h1>
        <div className="area-flex-col mod-postion-relative mod-gap-none" style={{ alignItems: 'stretch', width: '100%' }}>
          <COM_SearchBar
            input={input ?? ''}
            submit={false}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
          {input && showCompletions && (
            <div className="look-div-completion mod-z-1" style={{ width: '100%' }}>
              <PRV_SearchStore args={utStoreArgs} showFallback={true}>
                <COM_SearchCompletion
                  onSelect={(val) => {
                    navigate(`/companies/page/${val}`);
                  }}
                  prQuery={input}
                />
              </PRV_SearchStore>
            </div>
          )}
        </div>
        {showResults && (
          <PRV_SearchStore args={[submittedQuery, false, 'search']} showFallback={true}>
            <COM_SearchResults />
          </PRV_SearchStore>
        )}
        <COM_Footer />
      </div>
    </div>
  );
}
