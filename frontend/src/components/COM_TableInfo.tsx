import { useState, type SetStateAction } from 'react';
import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useCompanyStoreSync } from '../hooks/hooks';
import { useKPIStore } from '../context/CTX_KPIStore';
import { useKPIStoreSync } from '../hooks/hooks';
import { getRoleText } from '../utils/functions';
import { cleanCompanyData } from '../utils/formats';
import COM_KPIInfo from './COM_KPIInfo';
import type { TYP_APIResponseKPI } from '../types/types';
import type { Dispatch } from 'react';

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
  const utCompanyStore = useCompanyStore();
  const utKpiStore = useKPIStore();
  const utText = getRoleText(prTableRole);
  const [stKPIs, setStKPIs] = useState<TYP_APIResponseKPI | null>(null);
  const [stData, setStData] = useState<Record<string, any> | null>(null);

  useCompanyStoreSync(utCompanyStore, setStData);
  useKPIStoreSync(utKpiStore, setStKPIs as Dispatch<SetStateAction<Record<string, any> | null>>);

  if (!stData || !stData.latest_entries || !stKPIs) return null;
  const flattenedData = cleanCompanyData({ prTableRole, prKPIs: stKPIs, prData: stData });
  return (
    <>
      <div className="area-flex-col mod-align-stretch">
        <h3 className="look-text-x2 look-text-normal">{utText}</h3>
        <div className="look-div-subtle">
          {Object.entries(flattenedData).map(([key, value]) => (
            <COM_KPIInfo prTableRole={prTableRole} prKPI={key} prValue={value} />
          ))}
        </div>
      </div>
    </>
  );
}
