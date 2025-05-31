import SearchBar from "../components/SearchBar";
import { useParams } from "react-router-dom";

function SearchPage() {
  const { search_query } = useParams<{ search_query: string }>();

  return (
      <SearchBar inputDefault={search_query || ""} />
  );
}

export default SearchPage;