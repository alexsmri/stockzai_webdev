import { Line } from 'react-chartjs-2';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync, useWindowDimensions } from '../hooks/hooks';
import { useState } from 'react';
import { getKPIScoring, getKPIText, getChangeColor, getChangeBackground } from '../utils/functions';
import { MOBILE_BREAKPOINT } from '../constants';
import {
  Chart as ChartJS,
  CategoryScale,
  LineElement,
  Title,
  LinearScale,
  TimeScale,
  Tooltip,
  PointElement,
  Filler,
} from 'chart.js';

type CompanyIntelSeries = Record<string, number>;
type CompanyStoreRecord = {
  company_intel?: Record<string, CompanyIntelSeries>;
};

const CHART_WIDTH_VW_DESKTOP = 50;
const CHART_HEIGHT_VH_DESKTOP = 50;
const CHART_HEIGHT_VH_MOBILE = 20;
const CHART_WIDTH_VW_MOBILE = 75;

interface ChartLineProps {
  KPI: string;
}

function getKPIChange(prKPIData: CompanyIntelSeries) {
  const utDataLen = Object.keys(prKPIData).length;
  if (utDataLen >= 2) {
    const utNew = prKPIData[Object.keys(prKPIData)[utDataLen - 1]];
    const utOld = prKPIData[Object.keys(prKPIData)[0]];
    const utAbsolute = utNew - utOld;
    const utChange = (utAbsolute / Math.abs(utOld)) * 100;
    return utChange;
  }
  return 0;
}

export default function COM_ChartLine({ KPI }: ChartLineProps) {
  const store = useCompaniesStore();
  const { width: utWidth, height: utHeight } = useWindowDimensions();
  const [companyData, setCompanyData] = useState<CompanyStoreRecord | null>(null);
  const [kpiCatalog, setKpiCatalog] = useState<Record<string, unknown> | null>(null);

  useCompaniesStoreSync<CompanyStoreRecord>(store, 'PropertyCompanyProfile', setCompanyData);
  useCompaniesStoreSync(store, 'PropertyCompanyKPIs', setKpiCatalog);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    TimeScale
  );
  const text = getKPIText(KPI);

  const KPIData = companyData?.company_intel?.[KPI];
  if (!KPIData || !kpiCatalog) return null;

  const utKPIScoring = getKPIScoring(KPI, kpiCatalog as Record<string, unknown>);
  const utChange = getKPIChange(KPIData);
  const utLineColor = getChangeColor(utChange * utKPIScoring);
  const utBGColor = getChangeBackground(utChange * utKPIScoring);
  const utChartWidth =
    utWidth > MOBILE_BREAKPOINT
      ? utWidth * (CHART_WIDTH_VW_DESKTOP / 100)
      : utWidth * (CHART_WIDTH_VW_MOBILE / 100);
  const utChartHeight =
    utWidth > MOBILE_BREAKPOINT
      ? utHeight * (CHART_HEIGHT_VH_DESKTOP / 100)
      : utHeight * (CHART_HEIGHT_VH_MOBILE / 100);
  const labels = Object.keys(KPIData).map((key) => {
    try {
      return new Date(key).toLocaleDateString('en-US');
    } catch {
      return key;
    }
  });
  const dataValues = Object.values(KPIData);
  const chartData = {
    labels,
    datasets: [
      {
        label: `${text}`,
        data: dataValues,
        borderColor: utLineColor,
        tension: 0.4,
        fill: {
          target: 'origin',
          above: utBGColor,
          below: utBGColor,
        },
        responsive: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div>
      <Line
        datasetIdKey={KPI}
        data={chartData}
        width={`${utChartWidth}px`}
        height={`${utChartHeight}px`}
        options={chartOptions}
      ></Line>
    </div>
  );
}
