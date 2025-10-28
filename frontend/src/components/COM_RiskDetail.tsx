import { useMemo, useState } from 'react';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import type { TYP_APIResponseKPI } from '../types/types';
import { getKPIText } from '../utils/functions';
import { getRiskFactorText } from '../utils/formats';
import { getRiskLevelMeta, parseRiskScoresDict, withAlpha, type RiskFactorKey } from '../utils/risk';

type CompanyProfileRecord = {
  latest_entries?: Record<string, unknown>;
};

interface PRI_RiskDetail {
  prRiskKey: RiskFactorKey;
}

export default function COM_RiskDetail({ prRiskKey }: PRI_RiskDetail) {
  const store = useCompaniesStore();
  const [companyData, setCompanyData] = useState<CompanyProfileRecord | null>(null);
  const [kpiCatalog, setKpiCatalog] = useState<TYP_APIResponseKPI | null>(null);

  useCompaniesStoreSync(store, 'PropertyCompanyProfile', setCompanyData);
  useCompaniesStoreSync(store, 'PropertyCompanyKPIs', setKpiCatalog);

  const hasRiskScores = useMemo(() => {
    if (!kpiCatalog) {
      return false;
    }
    return Object.values(kpiCatalog).some((entry) => entry?.KPI === 'riskScoresDict');
  }, [kpiCatalog]);

  if (!hasRiskScores || !companyData?.latest_entries) {
    return null;
  }

  const rawRiskDict =
    companyData.latest_entries.riskScoresDict ??
    companyData.latest_entries.risk_scores_dict ??
    null;

  const parsed = parseRiskScoresDict(rawRiskDict);
  const severity = parsed[prRiskKey];
  if (severity === undefined) {
    return null;
  }

  const { label, color } = getRiskLevelMeta(severity);
  const severityColor = withAlpha(color, 0.8);
  const severityBackground = withAlpha(color, 0.12);
  const kpiLabel = getKPIText(prRiskKey) ?? prRiskKey;
  const description = getRiskFactorText(prRiskKey, severity);

  return (
    <div className="look-div-subtle area-flex-col mod-gap-xxs mod-padding-s">
      <div className="area-flex-row mod-space-between mod-align-center">
        <p className="look-text-x0 look-priority-low">{kpiLabel}</p>
        <span
          className="look-text-x0 look-text-normal"
          style={{
            color: severityColor,
            backgroundColor: severityBackground,
            borderRadius: '999px',
            padding: '0.2rem 0.6rem',
            fontWeight: 600,
          }}
        >
          {label} ({severity}/5)
        </span>
      </div>
      <p className="look-text-x1">{description}</p>
    </div>
  );
}
