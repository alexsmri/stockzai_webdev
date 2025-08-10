import { Line } from 'react-chartjs-2';
import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useCompanyStoreSync, useKPIStoreSync, useWindowDimensions } from '../hooks/hooks';
import { useState } from 'react';
import { getKPIScoring, getKPIText, getChangeColor, getChangeBackground } from '../utils/functions';
import { MOBILE_BREAKPOINT } from '../constants';
import {
  Chart as ChartJS,
  CategoryScale,
  LineElement,
  Title,
  LinearScale,
  Tooltip,
  PointElement,
  Filler,
} from 'chart.js';
import { useKPIStore } from '../context/CTX_KPIStore';

const CHART_WIDTH_VW = 50;
const CHART_HEIGHT_VH_DESKTOP = 50;
const CHART_HEIGHT_VH_MOBILE = 20;

interface ChartLineProps {
  KPI: string;
}

function getKPIChange(prKPIData: Record<any, any>) {
  const utDataLen = Object.keys(prKPIData).length;
  if (utDataLen >= 2) {
    const utNew = prKPIData[Object.keys(prKPIData)[utDataLen - 1]];
    const utOld = prKPIData[Object.keys(prKPIData)[0]];
    const utAbsolute = utNew - utOld;
    const utChange = (utAbsolute / Math.abs(utOld)) * 100;
    return utChange;
  } else {
    return 0;
  }
}

export default function COM_ChartLine({ KPI }: ChartLineProps) {
  const utCompanyStore = useCompanyStore();
  const utKPIStore = useKPIStore();
  const { width: utWidth, height: utHeight } = useWindowDimensions();
  const [stData, setStData] = useState<Record<string, any> | null>(null);
  const [stKPIs, setStKPIs] = useState<Record<string, any> | null>(null);
  useCompanyStoreSync(utCompanyStore, setStData);
  useKPIStoreSync(utKPIStore, setStKPIs);

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);
  const text = getKPIText(KPI);
  if (!stData) return null;
  const KPIData = stData.company_intel?.[KPI];
  if (!KPIData) return null;

  const utKPIScoring = getKPIScoring(KPI, stKPIs);
  const utChange = getKPIChange(KPIData);
  const utLineColor = getChangeColor(utChange * utKPIScoring);
  const utBGColor = getChangeBackground(utChange * utKPIScoring);
  const utChartWidth = utWidth * (CHART_WIDTH_VW / 100);
  const utChartHeight =
    utWidth > MOBILE_BREAKPOINT
      ? utHeight * (CHART_HEIGHT_VH_DESKTOP / 100)
      : utHeight * (CHART_HEIGHT_VH_MOBILE / 100);
  const labels = Object.keys(KPIData).map((key) => {
    try {
      return new Date(key).toDateString();
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
    scales: {
      //xAxes: {
      //  display: true,
      //  type: 'time',
      //  time: {
      //    displayFormats: {
      //      day: 'MM DD YYYY',
      //    },
      //  },
      // },
      y: {
        ticks: {
          display: false,
        },
      },
    },
  };
  return (
    <div className="area-flex-wrap" style={{ minWidth: '40vw' }}>
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
