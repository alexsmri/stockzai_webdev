import { useState } from 'react';
import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useCompanyStoreSync } from '../hooks/hooks';
import { useKPIStore } from '../context/CTX_KPIStore';
import { useKPIStoreSync } from '../hooks/hooks';
import { getRoleText } from '../utils/functions';
import { flattenObject } from '../utils/formats';
import COM_KPIInfo from './COM_KPIInfo';

interface ITF_TableInfoProps {
  prTableRole:
    | 'income_statement'
    | 'balance_sheet'
    | 'cashflow_statement'
    | 'basics'
    | 'ratios'
    | 'valuation';
}

export default function COM_TableInfo({ prTableRole }: ITF_TableInfoProps) {
  const utCompanyStore = useCompanyStore();
  const utKpiStore = useKPIStore();
  const utText = getRoleText(prTableRole);
  const [stKPIs, setStKPIs] = useState<Record<string, any> | null>(null);
  const [stData, setStData] = useState<Record<string, any> | null>(null);

  useCompanyStoreSync(utCompanyStore, setStData);
  useKPIStoreSync(utKpiStore, setStKPIs);

  if (!stData || !stData.latest_entries || !stKPIs) return null;
  const table_entries = Object.entries(stKPIs)
    .filter(([_, value]) => value.role === prTableRole)
    .map(([key, value]) => ({
      key,
      ...value,
    }));
  const cleanedData = Object.entries(table_entries).filter(
    ([_, value]) =>
      Object.keys(stData.latest_entries).includes(value.KPI) &&
      stData.latest_entries[value.KPI] !== undefined &&
      stData.latest_entries[value.KPI] !== null
  );
  console.log('cleanedData');
  console.log(cleanedData);
  const flattenedData = flattenObject(cleanedData);
  return (
    <>
      <div className="area-flex-col">
        <h3 className="look-text-x2">{utText}</h3>
        <div className="look-div-container">
          {Object.entries(flattenedData).map(([key, value]) => (
            <COM_KPIInfo prTableRole={prTableRole} prInfo={value} prKey={key} prValue={1} />
          ))}
        </div>
      </div>
    </>
  );
}
