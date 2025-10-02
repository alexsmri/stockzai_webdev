import { PRV_SearchStore } from '../context/CTX_SearchStore';
import { useState } from 'react';
import COM_SearchBar from '../components/COM_SearchBar';
import COM_SearchResults from '../components/COM_SearchResults';
import { useNavigate } from 'react-router-dom';
import COM_SearchCompletion from '../components/COM_SearchCompletion';
import COM_Sidebar from '../components/COM_Sidebar';
import COM_Footer from '../components/COM_Footer';

export default function PAG_Search() {
  const navigate = useNavigate();

  const [submittedQuery, setSubmittedQuery] = useState<string | ''>('');
  const [input, setInput] = useState<string>('');
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const utStoreArgs = [input, input.length <= 2, 'completion'] as [string, boolean, string];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length > 0) {
      setShowResults(false);
      setSubmittedQuery(input);
      setShowCompletions(false);
      setShowResults(true);
    }
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
