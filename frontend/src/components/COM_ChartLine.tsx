import { Line } from 'react-chartjs-2';
import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useCompanyStoreSync, useKPIStoreSync } from '../hooks/hooks';
import { useState } from 'react';
import { getKPIScoring, getKPIText } from '../utils/functions';
import {
  Chart as ChartJS,
  CategoryScale,
  LineElement,
  Title,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import { useKPIStore } from '../context/CTX_KPIStore';

interface ChartLineProps {
  KPI: string;
}

export default function COM_ChartLine({ KPI }: ChartLineProps) {
  const utCompanyStore = useCompanyStore();
  const utKPIStore = useKPIStore();
  const [stData, setStData] = useState<Record<string, any> | null>(null);
  const [, setStKPIs] = useState<Record<string, any> | null>(null);
  useCompanyStoreSync(utCompanyStore, setStData);
  useKPIStoreSync(utKPIStore, setStKPIs);

  const utKPIScoring = getKPIScoring(KPI, utKPIStore);

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  const text = getKPIText(KPI);
  if (!stData) return null;
  const KPIData = stData.company_intel?.[KPI];
  if (!KPIData) return null;

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
    datasets: [{ label: `${text}`, data: dataValues, borderColor: 'white' }],
  };

  return <Line datasetIdKey={KPI} data={chartData}></Line>;
}
