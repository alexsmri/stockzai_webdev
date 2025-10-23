import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import DCOM_TableInfo from './dumb/DCOM_TableInfo';
import { useState } from 'react';
import {
  formatLargeNumber,
  getKPIData,
  getKPIDetails,
  getPercentileColor,
} from '../utils/functions';
import { calcAverage, calcChange1Y } from '../utils/math';
import { formatPercentile, formatPercentileEstimate } from '../utils/formats';
import type { TYP_APIResponseKPI } from '../types/types';

type CompanyProfileRecord = {
  company_intel?: Record<string, Record<string, number>>;
  [key: string]: unknown;
};
const ROLE_BLOB_LOOKUP = {
  ratios: 'finScoresDict',
  valuation: 'valScoresDict',
};

interface PI_TableKPIDetail {
  prKPI: string;
  prOnMount?: (element: HTMLDivElement | null) => void;
}

export default function COM_TableKPIDetail({ prKPI, prOnMount }: PI_TableKPIDetail) {
  const store = useCompaniesStore();
  const [companyData, setCompanyData] = useState<CompanyProfileRecord | null>(null);
  const [kpiCatalog, setKpiCatalog] = useState<TYP_APIResponseKPI | null>(null);

  useCompaniesStoreSync(store, 'PropertyCompanyProfile', setCompanyData);
  useCompaniesStoreSync<TYP_APIResponseKPI>(store, 'PropertyCompanyKPIs', setKpiCatalog);

  if (!companyData || !kpiCatalog) return null;

  const utRole: 'ratios' | 'valuation' = getKPIDetails({ prKPI, prKPIs: kpiCatalog })['role'];
  const utBlob = getKPIData({
    prKPI: ROLE_BLOB_LOOKUP[utRole],
    prData: companyData,
  });

  const utKPIData = getKPIData({ prKPI, prData: companyData });
  const utSectorData = getKPIData({ prKPI: 'sector', prData: companyData });
  const utSector = utSectorData.latest_entry || 'Sector';

  let utPercentile = null;
  let utPercentileDict = null;

  const utAverage = calcAverage(Object.values(utKPIData.data));
  const utChange = calcChange1Y(utKPIData.data).changePct;
  const tableData: Record<string, any> = {
    'Current Value': utKPIData.latest_entry,
    'Trailing AVG': utAverage,
  };

  if (utBlob && Object.keys(utBlob).length && utBlob.data && utBlob.latest_entry) {
    utPercentile = formatPercentile(utBlob.latest_entry[prKPI]);
    utPercentileDict = {
      value: utPercentile,
      color: getPercentileColor(utPercentile),
      text: `Better than ~${formatPercentileEstimate(utPercentile)}% of Stocks in ${utSector}`,
    };
    tableData['Ratio Score /10'] = utPercentileDict;
  }

  if (utChange !== null) {
    tableData['Change 1Y'] = `${formatLargeNumber(utChange)}%`;
  }

  return (
    <div data-tutorial="kpi-details-table" ref={prOnMount}>
      <DCOM_TableInfo prTitle="Details" prData={tableData} prType="table" />
    </div>
  );
}
