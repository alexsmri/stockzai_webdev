import { useState } from 'react';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { getRoleText } from '../utils/functions';
import { cleanCompanyData } from '../utils/formats';
import COM_KPIInfo from './COM_KPIInfo';
import type { TYP_APIResponseKPI } from '../types/types';

interface ITF_TableInfoProps {
  prTableRole:
    | 'income_statement'
    | 'balance_sheet'
    | 'cashflow_statement'
    | 'basics'
    | 'ratios'
    | 'valuation'
    | 'blobs';
}

export default function COM_TableInfo({ prTableRole }: ITF_TableInfoProps) {
  const store = useCompaniesStore();
  const text = getRoleText(prTableRole);
  const [kpiCatalog, setKpiCatalog] = useState<TYP_APIResponseKPI | null>(null);
  const [companyData, setCompanyData] = useState<Record<string, any> | null>(null);

  useCompaniesStoreSync(store, 'PropertyCompanyProfile', setCompanyData);
  useCompaniesStoreSync<TYP_APIResponseKPI>(store, 'PropertyCompanyKPIs', setKpiCatalog);

  if (!companyData || !companyData.latest_entries || !kpiCatalog) return null;
  const flattenedData = cleanCompanyData({ prTableRole, prKPIs: kpiCatalog, prData: companyData });
  return (
    <>
      <div className="area-flex-col mod-align-stretch">
        <h3 className="look-text-x2 look-text-normal">{text}</h3>
        <div className="look-div-subtle">
          {Object.entries(flattenedData).map(([key, value]) => (
            <COM_KPIInfo prTableRole={prTableRole} prKPI={key} prValue={value} />
          ))}
        </div>
      </div>
    </>
  );
}
