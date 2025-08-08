import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useKPIStore } from '../context/CTX_KPIStore';
import { useCompanyStoreSync, useKPIStoreSync } from '../hooks/hooks';
import DCOM_TableInfo from './dumb/DCOM_TableInfo';
import { useState } from 'react';
import { getKPIData, getKPIDetails } from '../utils/formats';
import { calcAverage } from '../utils/math';

const ROLE_BLOB_LOOKUP = {
  ratios: 'finScoresDict',
  valuation: 'valScoresDict',
};
const PERCENTILE_MULTIPLICATION = 10;

export default function COM_TableKPIDetail({ prKPI }: { prKPI: string }) {
  const utCompanyStore = useCompanyStore();
  const utKPIStore = useKPIStore();
  const [stData, setStData] = useState<Record<any, any> | null>(null);
  const [stKPIs, setStKPIs] = useState<Record<any, any> | null>(null);

  useCompanyStoreSync(utCompanyStore, setStData);
  useKPIStoreSync(utKPIStore, setStKPIs);

  if (!stData || !stKPIs) return null;

  const utRole: 'ratios' | 'valuation' = getKPIDetails({ prKPI, prKPIs: stKPIs })['role'];
  const utBlob = getKPIData({
    prKPI: ROLE_BLOB_LOOKUP[utRole],
    prData: stData,
  });
  const utKPIData = getKPIData({ prKPI, prData: stData });

  const utPercentile =
    utBlob.latest_entry[`${ROLE_BLOB_LOOKUP[utRole]}${prKPI}`] * PERCENTILE_MULTIPLICATION;

  const utAverage = calcAverage(Object.values(utKPIData.data));
  const utDates = Object.keys(utKPIData.data).sort((a, b) =>
    Date.parse(a) > Date.parse(b) ? -1 : 1
  );
  const utOld = utKPIData.data[utDates[1]];
  const utNew = utKPIData.data[utDates[0]];
  const utAbsolute = utNew - utOld;
  const utChange = (utAbsolute / Math.abs(utOld)) * 100;

  const tableData = {
    'Current Value': utKPIData.latest_entry,
    'Change 1Y': utChange,
    'Trailing AVG': utAverage,
    'Sector Percentile': utPercentile,
  };

  return <DCOM_TableInfo prTitle="Details" prData={tableData} />;
}
