import { getScoreColor, getDashOffset } from '../utils/functions';
import { useCompanyStoreSync } from '../hooks/hooks';
import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useState } from 'react';
import COM_IndicatorChange from './COM_IndicatorChange';
import { useLightbox } from '../context/CTX_Lightbox';
interface PI_ScoreRadial {
  KPI: 'financial_score' | 'valuation_score'; // Optional type for the score
}

function getScoreText(scoreKPI: 'financial_score' | 'valuation_score'): string {
  switch (scoreKPI) {
    case 'financial_score':
      return 'Financials';
    case 'valuation_score':
      return 'Valuation';
  }
}

function COM_ScoreRadial({ KPI }: PI_ScoreRadial) {
  const store = useCompanyStore();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useCompanyStoreSync(store, setData);
  const { handleLBOpen } = useLightbox();

  if (!data || !data.latest_entries[KPI]) return null;
  const score = data.latest_entries[KPI];
  const color = getScoreColor(score);
  const offset = getDashOffset(score);
  const text = getScoreText(KPI);
  return (
    <>
      <div className="area-flex-col">
        <svg width="8REM" height="8REM" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="3%"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="264"
            strokeDashoffset="0"
            transform="rotate(-70 50 50)"
          ></circle>
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke={color}
            strokeWidth="3%"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="264"
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          ></circle>

          <text
            className="mod-cursor-pointer"
            x="50%"
            y="53%"
            textAnchor="middle"
            onClick={() => handleLBOpen(KPI)}
          >
            {text}
          </text>
        </svg>
        <COM_IndicatorChange prKPI={KPI} />
      </div>
    </>
  );
}

export default COM_ScoreRadial;
