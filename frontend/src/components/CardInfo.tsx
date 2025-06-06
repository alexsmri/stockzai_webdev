import { useState } from "react";
import { useCompanyStore } from "../context/CompanyStoreContext";
import type { CompanyAPIResponse } from "../types/types";
import { useCompanyStoreSync } from "../hooks/hooks";
import { getKPIText } from "../utils/functions";

interface CardInfoProps {
  KPI: string;
}

export default function CardInfo({ KPI }: CardInfoProps) {
  const store = useCompanyStore();
  const [data, setData] = useState<CompanyAPIResponse | null>(null);

  useCompanyStoreSync(store, setData);

  if (!data || !data.latest_entries[KPI]) return null;
  const title = getKPIText(KPI);
  return (
    <>
      <div className="border border-subtle rounded-xs p-3">
        <strong>{title}</strong>
        <p>{data.latest_entries[KPI]}</p>
      </div>
    </>
  );
}
