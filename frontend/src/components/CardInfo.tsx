import { useState } from "react";
import { useCompanyStore } from "../context/CompanyStoreContext";
import type { CompanyAPIResponse } from "../types/types";
import { useCompanyStoreSync } from "../hooks/hooks";
import { getKPIText } from "../utils/functions";

interface InfoCardProps {
  KPI: string;
}

export default function InfoCard({ KPI }: InfoCardProps) {
  const store = useCompanyStore();
  const [data, setData] = useState<CompanyAPIResponse | null>(null);

  useCompanyStoreSync(store, setData);

  if (!data || !data.latest_entries[KPI]) return null;
  const title = getKPIText(KPI);
  return (
    <>
      <div>
        <h5>{title}</h5>
        <p>{data.latest_entries[KPI]}</p>
      </div>
    </>
  );
}
