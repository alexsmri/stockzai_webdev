import { useMemo, useState } from 'react';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { parseRiskScoresDict, type RiskFactorKey, type RiskLevel } from '../utils/risk';
import COM_RiskScore from './COM_RiskScore';
import COM_RiskDetail from './COM_RiskDetail';

type CompanyProfileRecord = {
  latest_entries?: Record<string, unknown>;
};

export default function COM_SectionRisk() {
  const store = useCompaniesStore();
  const [companyData, setCompanyData] = useState<CompanyProfileRecord | null>(null);

  useCompaniesStoreSync(store, 'PropertyCompanyProfile', setCompanyData);

  const latestEntries = companyData?.latest_entries ?? null;
  const riskDictRaw =
    latestEntries?.riskScoresDict ??
    latestEntries?.risk_scores_dict ??
    null;

  const orderedKeys = useMemo(() => {
    const parsed = parseRiskScoresDict(riskDictRaw);
    return Object.entries(parsed)
      .filter((entry): entry is [RiskFactorKey, RiskLevel] => entry[1] !== undefined)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key as RiskFactorKey);
  }, [riskDictRaw]);

  const factorCount = orderedKeys.length;

  if (!riskDictRaw && factorCount === 0) {
    return null;
  }

  const label = `Identified ${factorCount} Risk Factor${factorCount === 1 ? '' : 's'}`;

  return (
    <div className="look-div-subtle area-flex-col mod-align-stretch mod-gap-m mod-padding-m">
      <div className="area-flex-row mod-space-between mod-align-center">
        <h3 className="look-text-x0 look-text-subtle">Risk Factors.</h3>
      </div>
      <COM_RiskScore />
      <p className="look-text-x1 look-text-normal">{label}</p>
      <div className="area-flex-col mod-gap-s mod-align-stretch">
        {factorCount > 0 ? (
          orderedKeys.map((riskKey) => <COM_RiskDetail key={riskKey} prRiskKey={riskKey} />)
        ) : (
          <p className="look-text-x1 look-text-subtle">No risk factors recorded.</p>
        )}
      </div>
    </div>
  );
}
