import { PRV_SearchStore } from '../context/CTX_SearchStore';
import { useState } from 'react';
import COM_SearchBar from '../components/COM_SearchBar';
import COM_SearchResults from '../components/COM_SearchResults';
import { useNavigate } from 'react-router-dom';
import COM_SearchCompletion from '../components/COM_SearchCompletion';
import COM_Hero from '../components/COM_Hero';
import COM_Navbar from '../components/COM_Navbar';
import COM_Footer from '../components/COM_Footer';

export default function PAG_Search() {
  const navigate = useNavigate();

  const [submittedQuery, setSubmittedQuery] = useState<string | ''>('');
  const [input, setInput] = useState<string>('');
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const utStoreArgs = (input.length <= 2 ? [input, true] : [input, false]) as [string, boolean?];
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
    <>
      <COM_Navbar />
      <COM_Hero>
        <h1 className="look-text-x7">Search Ticker</h1>
        <div className="area-flex-col mod-postion-relative">
          <COM_SearchBar
            input={input ?? ''}
            submit={false}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          ></COM_SearchBar>
          {input && showCompletions && (
            <div className="look-div-completion mod-z-1">
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
      </COM_Hero>
      {showResults && (
        <PRV_SearchStore args={[submittedQuery]} showFallback={true}>
          <COM_SearchResults />
        </PRV_SearchStore>
      )}
      <COM_Footer />
    </>
  );
}
