import { PRV_SearchStore } from "../context/CTX_SearchStore";
import { useState } from "react";
import COM_SearchBar from "../components/COM_SearchBar";
import COM_ComparisonResults from "../components/COM_ComparisonResults";
import COM_SearchCompletion from "../components/COM_SearchCompletion";
import COM_Hero from "../components/COM_Hero";
import COM_Navbar from "../components/COM_Navbar";

export default function PAG_Compare() {
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
     <COM_Navbar />
      <COM_Hero>
          <h1 className="look-text-x7">Compare Tickers</h1>
        <div className="area-flex-col mod-postion-relative">
          <COM_SearchBar
            input={input ?? ""}
            submit={false}
            handleChange={handleChange}
          ></COM_SearchBar>
          {input.length > 2 && showCompletions && (
            <div className="look-div-completion mod-z-1">
              <PRV_SearchStore args={[input]}>
                <COM_SearchCompletion
                  onSelect={(val) => {
                    setSubmittedQuery(val);
                    setShowCompletions(false);
                    setShowResults(true);
                    setSubmitIndex((prev) => prev + 1);
                  }}
                />
              </PRV_SearchStore>
            </div>
          )}
        </div>
      </COM_Hero>
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
          <PRV_SearchStore args={[submittedQuery, true]}>
            <COM_ComparisonResults
              submittedQuery={submittedQuery}
              submitIndex={submitIndex}
            />
          </PRV_SearchStore>
        )}
      </div>
    </>
  );
}
