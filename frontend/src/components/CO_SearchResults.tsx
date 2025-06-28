import { useSearchStore } from "../context/SearchStoreContext";
import { useSearchStoreSync } from "../hooks/hooks";
import type { SearchAPIResponse } from "../types/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchResults() {
  const store = useSearchStore();
  const [data, setData] = useState<SearchAPIResponse | null>(null);

  useSearchStoreSync(store, setData)
  const navigate = useNavigate()

  return (
    <>
    <div className="area-grid-auto mod-gap-xl mod-margin-xl">
     {data && Object.entries(data).map(([symbol, value]) => (
        <div key={symbol} 
              className="area-flex-col look-div-container hover-scale mod-align-left mod-padding-l"
              onClick={() => {navigate(`/companies/page/${symbol}`)}}
              >
            <p className="look-text-x0">{value.sectorRanking ? `#${value.sectorRanking} in ${value.sector}` : `${value.sector}`}</p>
            <h5 className="look-text-x4 mod-align-left">{symbol}</h5>
            <p>{value.name}</p>
        </div>
     ))}
     </div>
    </>
  );
}

export default SearchResults;
