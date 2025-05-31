import { SearchStoreProvider } from "../context/SearchStoreContext";
import { useState, useEffect } from "react";
import SearchCompletion from "./SearchCompletion";
import SearchResults from "./SearchResults";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
    inputDefault?: string
}

export default function SearchBar({ inputDefault = "" }: SearchBarProps) {
    const [input, setInput] = useState<string>(inputDefault);
    const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
    const [showCompletions, setShowCompletions] = useState<boolean>(false);

    useEffect(() => {
    setInput(inputDefault);
    setSubmittedQuery(inputDefault || null);
  }, [inputDefault]);

    const navigate = useNavigate();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setShowCompletions(true);
    };
    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length > 1) {
      setSubmittedQuery(input);
      setShowCompletions(false);
    }
  };

    return (
    <>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onInput={handleInput}
            placeholder="Search for a ticker..."
          />
          <button type="submit">Submit</button>
        </form>

        {/* Completions shown while typing */}
        {input.length > 1 && showCompletions && (
            <SearchStoreProvider args={[input]}>
              <SearchCompletion onSelect={(val) => {
                navigate(`/companies/page/${val}`)
              }} />
            </SearchStoreProvider>
        )}

        {/* Results only shown after search submitted */}
        {submittedQuery && (
            <SearchStoreProvider args={[submittedQuery]}>
              <SearchResults />
            </SearchStoreProvider>
        )}
    </>
  );
}