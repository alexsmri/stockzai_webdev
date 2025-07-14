import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';
import COM_Footer from '../components/COM_Footer';
import { useWinnerStore } from '../context/CTX_WinnerStore';
import { useWinnerStoreSync } from '../hooks/hooks';
import { useState } from 'react';
import COM_Loading from '../components/COM_Loading';
import DCOM_IndicatorChange from '../components/dumb/DCOM_IndicatorChange';
import DCOM_ScoreRadial from '../components/dumb/DCOM_ScoreRadial';

function PAG_Home() {
  const [stWinners, setStWinners] = useState<Record<string, any> | null>(null);
  const utStore = useWinnerStore();

  useWinnerStoreSync(utStore, setStWinners);
  console.log(stWinners);

  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <h1 className="look-text-x7">Master the Market. Effortlessly.</h1>
        <div className="area-flex-col look-div-container">
          <h3 className="look-text-x4">Last month's best predictions</h3>
          {stWinners ? (
            <div className="area-flex-row">
              {Object.keys(stWinners).map((key) => {
                const utScore = stWinners[key]['totalScore'];
                const utChange = stWinners[key]['priceChange'];
                return (
                  <div className="area-flex-col look-div-container">
                    <DCOM_IndicatorChange prChange={utChange} prShowDiv={true} />
                    <p className="look-text-x4">{key}</p>
                    <DCOM_ScoreRadial prScore={utScore} />
                  </div>
                );
              })}
            </div>
          ) : (
            <COM_Loading />
          )}
        </div>
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_Home;
