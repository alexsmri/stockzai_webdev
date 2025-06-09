import { useState } from "react";
import { useCompanyStore } from "../context/CompanyStoreContext";
import type { CompanyAPIResponse, KPIAPIResponse } from "../types/types";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useKPIStore } from "../context/KPIStoreContext";
import { useKPIStoreSync } from "../hooks/hooks";
import { getKPIText } from "../utils/functions";
import { useLightbox } from "../context/LightboxContext";

interface TableInfoProps {
  table_role: "income_statement" | "balance_sheet" | "cashflow_statement";
}

export default function TableInfo({ table_role }: TableInfoProps) {
  const company_store = useCompanyStore();
  const kpi_store = useKPIStore();
  const [KPIs, setKPIs] = useState<KPIAPIResponse | null>(null);
  const [data, setData] = useState<CompanyAPIResponse | null>(null);

  useCompanyStoreSync(company_store, setData);
  useKPIStoreSync(kpi_store, setKPIs);

  const { openWithKPI } = useLightbox();

  if (!data || !data.latest_entries || !KPIs) return null;
  const table_entries = Object.entries(KPIs)
    .filter(([_, value]) => value.role === table_role)
    .map(([key, value]) => ({
      key,
      ...value,
    }));

  return (
    <div className="flex flex-col border border-subtle rounded-x1 h-fit p-4 w-[30%] gap-3">
      {Object.entries(table_entries)
        .filter(([_, value]) =>
          Object.keys(data.latest_entries).includes(value.KPI)
        )
        .map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <strong
              className="cursor-pointer"
              onClick={() => openWithKPI(value.KPI)}
            >
              {getKPIText(value.KPI)}
            </strong>
            <p>{data.latest_entries[value.KPI]}</p>
          </div>
        ))}
    </div>
  );
}
