import { Line } from "react-chartjs-2";
import { useCompanyStore } from "../context/CTX_CompanyStore";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useState } from "react";
import { getKPIText } from "../utils/functions";
import {
  Chart as ChartJS,
  CategoryScale,
  LineElement,
  Title,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

interface ChartLineProps {
  KPI: string;
}

export default function COM_ChartLine({ KPI }: ChartLineProps) {
  const store = useCompanyStore();
  const [data, setData] = useState<Record<string, any> | null>(null);
  useCompanyStoreSync(store, setData);
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  const text = getKPIText(KPI);
  if (!data) return null;
  const KPIData = data.company_intel?.[KPI];
  if (!KPIData) return null;

  const labels = Object.keys(KPIData).map((key) => {
    try {
      return new Date(key).toDateString();
    } catch {
      return key;
    }
  });

  const dataValues = Object.values(KPIData);
  console.log(KPIData);
  const chartData = {
    labels,
    datasets: [{ label: `${text}`, data: dataValues, borderColor: "white" }],
  };

  return <Line datasetIdKey={KPI} data={chartData}></Line>;
}
