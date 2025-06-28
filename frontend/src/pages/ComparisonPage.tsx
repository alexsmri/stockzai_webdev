import { SearchStoreProvider } from "../context/SearchStoreContext";
import { useState } from "react";
import SearchBar from "../components/CO_SearchBar";
import ComparisonResults from "../components/CO_ComparisonResults";
import SearchCompletion from "../components/CO_SearchCompletion";
import CO_Hero from "../components/CO_Hero";
import CO_Navbar from "../components/CO_Navbar";

export default function SearchPage() {
  const [submittedQuery, setSubmittedQuery] = useState<string | "">("");
  const [input, setInput] = useState<string>("");
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [submitIndex, setSubmitIndex] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowCompletions(true);
  };

  return (
    <>
     <CO_Navbar />
      <CO_Hero>
          <h1 className="look-text-x7">Compare Tickers</h1>
        <div className="area-flex-col mod-postion-relative">
          <SearchBar
            input={input ?? ""}
            submit={false}
            handleChange={handleChange}
          ></SearchBar>
          {input.length > 2 && showCompletions && (
            <div className="look-div-completion mod-z-1">
              <SearchStoreProvider args={[input]}>
                <SearchCompletion
                  onSelect={(val) => {
                    setSubmittedQuery(val);
                    setShowCompletions(false);
                    setShowResults(true);
                    setSubmitIndex((prev) => prev + 1);
                  }}
                />
              </SearchStoreProvider>
            </div>
          )}
        </div>
      </CO_Hero>
      <div className="area-flex-col mod-margin-xl">
        <div className="area-grid-comparison mod-w-full">
          <p></p>
          <p className="look-text-x0">Symbol</p>
          <p className="look-text-x0">Name</p>
          <p className="look-text-x0">Sector</p>
          <p className="look-text-x0">Financial Score</p>
          <p className="look-text-x0">Valuation Score</p>
          <p className="look-text-x0">Sector Ranking</p>
        </div>
        {showResults && (
          <SearchStoreProvider args={[submittedQuery, true]}>
            <ComparisonResults
              submittedQuery={submittedQuery}
              submitIndex={submitIndex}
            />
          </SearchStoreProvider>
        )}
      </div>
    </>
  );
}
