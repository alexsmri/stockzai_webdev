import { useState, useEffect } from "react";
import { useCompanyStore } from "../context/CompanyStoreProvider";
import type { CompanyAPIResponse } from "../types/types";
import { useCompanyStoreSync } from "../hooks/hooks";

interface InfoCardProps {
  title: string;
  KPI: string;
}

export default function InfoCard({ title, KPI }: InfoCardProps) {
  const store = useCompanyStore();
  const [data, setData] = useState<CompanyAPIResponse | null>(null);

  useCompanyStoreSync(store, setData);

  if (!data || !data.latest_entries[KPI]) return null;
  return (
    <>
      <div>
        <h5>{title}</h5>
        <p>{data.latest_entries[KPI]}</p>
      </div>
    </>
  );
}
