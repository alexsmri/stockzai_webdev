import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useKPIStore } from '../context/CTX_KPIStore';
import { useCompanyStoreSync, useKPIStoreSync } from '../hooks/hooks';
import DCOM_TableInfo from './dumb/DCOM_TableInfo';
import { useState } from 'react';
import {
  formatLargeNumber,
  getKPIData,
  getKPIDetails,
  getPercentileColor,
} from '../utils/functions';
import { calcAverage, calcChange1Y } from '../utils/math';
import { formatPercentile } from '../utils/formats';

const ROLE_BLOB_LOOKUP = {
  ratios: 'finScoresDict',
  valuation: 'valScoresDict',
};

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
  const utSectorData = getKPIData({ prKPI: 'sector', prData: stData });
  const utSector = utSectorData.latest_entry || 'Sector';

  let utPercentile = null;
  let utPercentileDict = null;

  const utAverage = calcAverage(Object.values(utKPIData.data));
  const utChange = calcChange1Y(utKPIData.data).changePct;
  let tableData: Record<string, any> = {
    'Current Value': utKPIData.latest_entry,
    'Trailing AVG': utAverage,
  };

  if (utBlob && Object.keys(utBlob).length && utBlob.data && utBlob.latest_entry) {
    utPercentile = formatPercentile(utBlob.latest_entry[prKPI]);
    utPercentileDict = {
      value: utPercentile,
      color: getPercentileColor(utPercentile),
      text: `Better than ${100 - utPercentile}% of Stocks in ${utSector}`,
    };
    tableData['Sector Percentile'] = utPercentileDict;
  }

  if (utChange !== null) {
    tableData['Change 1Y'] = `${formatLargeNumber(utChange)}%`;
  }

  return <DCOM_TableInfo prTitle="Details" prData={tableData} prType="table" />;
}
