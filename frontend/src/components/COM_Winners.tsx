import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { useState } from 'react';
import DCOM_IndicatorChange from '../components/dumb/DCOM_IndicatorChange';
import DCOM_ScoreRadial from '../components/dumb/DCOM_ScoreRadial';
import { COM_ButtonDiscover } from './COM_ButtonDiscover';

const WINNER_CLASSES_LOOKUP = {
  mobile: 'area-flex-wrap mod-flex-grow-children mod-gap-l mod-padding-none',
  desktop: 'area-flex-row mod-flex-grow-children mod-gap-l mod-padding-none',
};

interface WinnerEntry {
  totalScore?: number;
  priceChange?: number;
  [key: string]: unknown;
}

type WinnersResponse = Record<string, WinnerEntry>;

function COM_Winners({ prBreakpoint }: { prBreakpoint: 'mobile' | 'desktop' }) {
  const [winners, setWinners] = useState<WinnersResponse | null>(null);
  const store = useCompaniesStore();

  useCompaniesStoreSync<WinnersResponse>(store, 'PropertyCompanyWinners', setWinners, {
    autoFetch: true,
  });

  if (!winners) {
    return null;
  }

  return (
    <div className={WINNER_CLASSES_LOOKUP[prBreakpoint]}>
      {Object.entries(winners).map(([key, value]) => {
        return (
          <div key={key} className="area-flex-col look-div-container">
            <div className="mod-right">
              <DCOM_IndicatorChange
                prChange={value.priceChange as number | null}
                prShowDiv={true}
              />
            </div>
            <p className="look-text-x4">{key}</p>
            <DCOM_ScoreRadial prScore={value.totalScore ?? 0} />
            <COM_ButtonDiscover prHref={`/companies/page/${key}`} />
          </div>
        );
      })}
    </div>
  );
}

export default COM_Winners;
