import { SearchStoreProvider } from "../context/SearchStoreContext";
import { useState, useEffect } from "react";
import SearchBar from "../components/CO_SearchBar";
import SearchResults from "../components/CO_SearchResults";
import { useNavigate } from "react-router-dom";
import SearchCompletion from "../components/CO_SearchCompletion";
import CO_Hero from "../components/CO_Hero";
import CO_Navbar from "../components/CO_Navbar";

export default function SearchPage() {
  const navigate = useNavigate();

  const [submittedQuery, setSubmittedQuery] = useState<string | "">("");
  const [input, setInput] = useState<string>("");
  const [showCompletions, setShowCompletions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length > 1) {
      setShowResults(false);
      setSubmittedQuery(input);
      setShowCompletions(false);
      setShowResults(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowCompletions(true);
    console.log(input);
    console.log(showCompletions);
  };

  return (
    <>
    <CO_Navbar />
    <CO_Hero>
      <h1 className="look-text-x7">Search Ticker</h1>
      <SearchBar
        input={input ?? ""}
        submit={false}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      ></SearchBar>
      {input.length > 2 && showCompletions && (
        <SearchStoreProvider args={[input]}>
          <SearchCompletion
            onSelect={(val) => {
              navigate(`/companies/page/${val}`);
            }}
          />
        </SearchStoreProvider>
      )}
    </CO_Hero>
      {showResults && (
        <SearchStoreProvider args={[submittedQuery]}>
          <SearchResults />
        </SearchStoreProvider>
      )}
    </>
  );
}
