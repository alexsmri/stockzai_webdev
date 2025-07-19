import { useSearchStore } from '../context/CTX_SearchStore';
import { useSearchStoreSync } from '../hooks/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VAI_SearchData } from '../types/interfaces';

function COM_SearchResults() {
  const store = useSearchStore();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useSearchStoreSync(store, setData);
  const navigate = useNavigate();
  const safeData = data as VAI_SearchData;
  return (
    <>
      <div className="area-grid-auto mod-gap-xl mod-margin-xl">
        {safeData?.results &&
          Object.entries(safeData.results).map(([symbol, value]) => (
            <div
              key={symbol}
              className="area-flex-col look-div-container hover-scale mod-align-left mod-padding-l"
              onClick={() => {
                navigate(`/companies/page/${symbol}`);
              }}
            >
              <p className="look-text-x0">
                {value.sectorRanking
                  ? `#${value.sectorRanking} in ${value.sector}`
                  : `${value.sector}`}
              </p>
              <h5 className="look-text-x4 mod-align-left">{symbol}</h5>
              <p>{value.name}</p>
            </div>
          ))}
      </div>
    </>
  );
}

export default COM_SearchResults;
