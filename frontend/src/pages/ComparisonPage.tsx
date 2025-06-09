import { SearchStoreProvider } from "../context/SearchStoreContext";
import { useState } from "react";
import SearchBar from "../components/CO_SearchBar";
import ComparisonResults from "../components/CO_ComparisonResults";
import SearchCompletion from "../components/CO_SearchCompletion";

export default function SearchPage() {
  const [submittedQuery, setSubmittedQuery] = useState<string | "">("");
  const [input, setInput] = useState<string>("");
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [submitIndex, setSubmitIndex] = useState<number>(0);

  //const handleSubmit = (e: React.FormEvent) => {
  //e.preventDefault();
  //if (input.length > 1) {
  //setSubmittedQuery(input);
  //setShowCompletions(false);
  //setShowResults(true)
  //setSubmitIndex((prev) => prev + 1)
  //}
  //};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowCompletions(true);
  };

  return (
    <>
      <div className="flex flex-col h-[30vh] bg-gradient-ambience">
        <div className="flex flex-col text-center m-auto gap-[0.9vw]">
          <h1>
            <span className="text-gradient-primary">Compare</span> Tickers
          </h1>
          <p>And find the best ones!</p>
        </div>
        <div className="relative flex flex-col w-[15vw] m-auto mb-[1vw] gap-[0.7vw]">
          <SearchBar
            input={input ?? ""}
            submit={false}
            handleChange={handleChange}
          ></SearchBar>
          {input.length > 2 && showCompletions && (
            <div className="absolute z-50 w-full top-full">
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
      </div>
      <div className="w-[80%] place-self-center mt-[4vw]">
        <div className="grid grid-cols-[5%_15%_auto_20%_20%] p-[0.4vw] text-center">
          <p></p>
          <p>Symbol</p>
          <p>Name</p>
          <p>Financial Score</p>
          <p>Valuation Score</p>
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
