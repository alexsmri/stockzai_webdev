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
// Tachymeter styling: leave a gap at the bottom and sweep clockwise from left to right.
const GAUGE_GAP_ANGLE = 90;
const GAUGE_GAP_RATIO = GAUGE_GAP_ANGLE / 360;
const GAUGE_GAP_LENGTH = CIRCUMFERENCE * GAUGE_GAP_RATIO;
const GAUGE_ARC_LENGTH = CIRCUMFERENCE - GAUGE_GAP_LENGTH;
const BASE_DASH_ARRAY = `${GAUGE_ARC_LENGTH} ${GAUGE_GAP_LENGTH}`;
const GAUGE_ROTATION = 90 + GAUGE_GAP_ANGLE / 2;

export default function COM_ScoreRisk() {
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
  const progress = Math.min(Math.max(score / 5, 0), 1);
  const activeArcLength = GAUGE_ARC_LENGTH * progress;
  const activeDashArray = `${activeArcLength} ${CIRCUMFERENCE - activeArcLength}`;

  return (
    <div className="area-flex-row mod-gap-m mod-align-center mod-padding-none">
      <svg width="10rem" height="10rem" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke={BASE_STROKE}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={BASE_DASH_ARRAY}
          strokeDashoffset="0"
          transform={`rotate(${GAUGE_ROTATION} 50 50)`}
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke={activeStroke}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={activeDashArray}
          strokeDashoffset="0"
          transform={`rotate(${GAUGE_ROTATION} 50 50)`}
        />
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          opacity="60%"
          className="look-text-x0"
          style={{ fill: `var(--color-secondary)`, fontSize: '90%' }}
        >
          Risk
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          className="look-text-x0"
          style={{ fill: `${withAlpha(color, 0.8)}`, fontSize: '90%' }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
