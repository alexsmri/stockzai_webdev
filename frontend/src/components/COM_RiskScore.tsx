import { useMemo, useState } from 'react';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { withAlpha, getRiskLevelMeta } from '../utils/risk';
import { toNumber } from '../utils/functions';
import COM_Tooltip from './COM_Tooltip';

type CompanyProfileRecord = {
  latest_entries?: Record<string, unknown>;
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const BASE_STROKE = 'rgba(255, 255, 255, 0.1)';
const LABEL_COLOR = 'rgba(255, 255, 255, 0.4)';

export default function COM_RiskScore() {
  const store = useCompaniesStore();
  const [companyData, setCompanyData] = useState<CompanyProfileRecord | null>(null);

  useCompaniesStoreSync(store, 'PropertyCompanyProfile', setCompanyData);

  const latestEntries = companyData?.latest_entries ?? null;
  const riskScoreRaw = latestEntries ? toNumber(latestEntries.risk_score) : null;

  const score = useMemo(() => {
    if (riskScoreRaw === null) {
      return null;
    }
    const clamped = Math.min(Math.max(riskScoreRaw, 0), 5);
    return clamped;
  }, [riskScoreRaw]);

  if (score === null) {
    return null;
  }

  const { level, label, color } = getRiskLevelMeta(score);
  const activeStroke = withAlpha(color, 0.8);
  const dashOffset = CIRCUMFERENCE - (score / 5) * CIRCUMFERENCE;
  const tooltipContent = (
    <div className="area-flex-col mod-gap-xs">
      <p className="look-text-x1 look-text-normal">
        Risk levels range from 0 (minimal) to 5 (severe). Scores aggregate the most material risk factors
        identified for the company.
      </p>
    </div>
  );

  return (
    <div className="area-flex-row mod-gap-m mod-align-center mod-padding-none">
      <svg width="82" height="82" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke={BASE_STROKE}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset="0"
          transform="rotate(-90 50 50)"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke={activeStroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 50 50)"
        />
        <text x="50%" y="54%" textAnchor="middle" className="look-text-x0 look-text-subtle">
          {`${level}/5`}
        </text>
      </svg>
      <div className="area-flex-col mod-gap-xxs mod-align-start mod-padding-none">
        <div className="area-flex-row mod-gap-xxs mod-align-center">
          <span className="look-text-x0 look-text-subtle" style={{ color: LABEL_COLOR }}>
            Risk
          </span>
          <COM_Tooltip prContent={tooltipContent} prLabel="How we score risk" />
        </div>
        <span className="look-text-x2 look-text-normal" style={{ color: activeStroke }}>
          {label}
        </span>
        <span className="look-text-x0 look-text-subtle">
          Level {score.toFixed(1)} / 5.0
        </span>
      </div>
    </div>
  );
}
