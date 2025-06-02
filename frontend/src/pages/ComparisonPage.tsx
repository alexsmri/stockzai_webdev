import { SearchStoreProvider } from "../context/SearchStoreContext";
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import ComparisonResults from "../components/ComparisonResults";
import SearchCompletion from "../components/SearchCompletion";

export default function SearchPage() {

    const [submittedQuery, setSubmittedQuery] = useState<string | "">("");
    const [input, setInput] = useState<string>("");
    const [ showCompletions, setShowCompletions ] = useState<boolean>(false)
    const [ showResults, setShowResults ] = useState<boolean>(false)
    const [submitIndex, setSubmitIndex ] = useState<number>(0)
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.length > 1) {
        setSubmittedQuery(input);
        setShowCompletions(false);
        setShowResults(true)
        setSubmitIndex((prev) => prev + 1)
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowCompletions(true);
    };

    return (
    <>
      <SearchBar input={input ?? ""} handleChange={handleChange} handleSubmit={handleSubmit}></SearchBar>
      {input.length > 2 && showCompletions && (
        <SearchStoreProvider args={[input]}>
            <SearchCompletion onSelect={(val) => {
              setSubmittedQuery(val)
              setShowCompletions(false)
              setShowResults(true)
              setSubmitIndex((prev) => prev + 1)
            }} />
        </SearchStoreProvider>
        )}
      {showResults && (
      <SearchStoreProvider args={[submittedQuery, true]}>
        <ComparisonResults submittedQuery={submittedQuery} submitIndex={submitIndex}/>
      </SearchStoreProvider>

      )}
    </>
  )
}