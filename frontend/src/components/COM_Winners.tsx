import { useWinnerStore } from '../context/CTX_WinnerStore';
import { useWinnerStoreSync } from '../hooks/hooks';
import { useState } from 'react';
import COM_Loading from '../components/COM_Loading';
import DCOM_IndicatorChange from '../components/dumb/DCOM_IndicatorChange';
import DCOM_ScoreRadial from '../components/dumb/DCOM_ScoreRadial';
import { PRV_WinnerStore } from '../context/CTX_WinnerStore';
import { COM_ButtonDiscover } from './COM_ButtonDiscover';

function COM_Winners() {
  const [stWinners, setStWinners] = useState<Record<string, any> | null>(null);
  const utStore = useWinnerStore();

  useWinnerStoreSync(utStore, setStWinners);

  return (
    <>
      <PRV_WinnerStore args={[]}>
        <h1 className="look-text-x7">Master the Market. Effortlessly.</h1>
        <div className="area-flex-col look-div-container">
          <h3 className="look-text-x4">Last month's best predictions</h3>
          {stWinners ? (
            <div className="area-flex-wrap mod-flex-grow-children">
              {Object.keys(stWinners).map((key) => {
                const utScore = stWinners[key]['totalScore'];
                const utChange = stWinners[key]['priceChange'];
                return (
                  <div className="area-flex-col look-div-container">
                    <div className="mod-right">
                      <DCOM_IndicatorChange prChange={utChange} prShowDiv={true} />
                    </div>
                    <p className="look-text-x4">{key}</p>
                    <DCOM_ScoreRadial prScore={utScore} />
                    <COM_ButtonDiscover prHref={`/companies/page/${key}`} />
                  </div>
                );
              })}
            </div>
          ) : (
            <COM_Loading />
          )}
        </div>
      </PRV_WinnerStore>
    </>
  );
}

export default COM_Winners;
