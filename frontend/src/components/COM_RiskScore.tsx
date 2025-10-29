import { useMemo, useState } from 'react';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { withAlpha, getRiskLevelMeta } from '../utils/risk';
import { toNumber } from '../utils/functions';

type CompanyProfileRecord = {
  latest_entries?: Record<string, unknown>;
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const BASE_STROKE = 'rgba(255, 255, 255, 0.1)';

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
    const clamped = Math.min(Math.max(riskScoreRaw / 2, 0), 5);
    return clamped;
  }, [riskScoreRaw]);

  if (score === null) {
    return null;
  }

  const { label, color } = getRiskLevelMeta(score);
  const activeStroke = withAlpha(color, 0.8);
  const dashOffset = CIRCUMFERENCE - (score / 5) * CIRCUMFERENCE;

  return (
    <div className="area-flex-row mod-gap-m mod-align-center mod-padding-none">
      <svg width="10rem" height="10rem" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          opacity="60%"
          className="look-text-x0"
          style={{ fill: `${withAlpha(color, 0.6)}` }}
        >
          Risk
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          className="look-text-x0"
          style={{ fill: `${withAlpha(color, 0.8)}` }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
