import { useState } from "react";
import { useCompanyStore } from "../context/CompanyStoreContext";
import type { CompanyAPIResponse, KPIAPIResponse } from "../types/types";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useKPIStore } from "../context/KPIStoreContext";
import { useKPIStoreSync } from "../hooks/hooks";
import { getKPIText } from "../utils/functions";
import { useLightbox } from "../context/LightboxContext";

interface PI_TableInfo {
  prTableRole: "income_statement" | "balance_sheet" | "cashflow_statement" | "basics";
}

export default function CO_TableInfo({ prTableRole }: PI_TableInfo) {
  const utCompanyStore = useCompanyStore();
  const utKpiStore = useKPIStore();
  const [stKPIs, setStKPIs] = useState<KPIAPIResponse | null>(null);
  const [stData, setStData] = useState<CompanyAPIResponse | null>(null);

  useCompanyStoreSync(utCompanyStore, setStData);
  useKPIStoreSync(utKpiStore, setStKPIs);

  const { handleLBOpen: handleLBOpen } = useLightbox();

  if (!stData || !stData.latest_entries || !stKPIs) return null;
  const table_entries = Object.entries(stKPIs)
    .filter(([_, value]) => value.role === prTableRole)
    .map(([key, value]) => ({
      key,
      ...value,
    }));

  return (
    <div className="look-div-container">
      {Object.entries(table_entries)
        .filter(([_, value]) =>
          Object.keys(stData.latest_entries).includes(value.KPI)
        )
        .map(([key, value]) => (
          <div key={key} className="area-flex-row mod-space-between">
            {prTableRole !== "basics" ? (
              <p className="look-button-ghost" onClick={() => handleLBOpen(value.KPI)}>
                {getKPIText(value.KPI)}
              </p>
            ) : (
              <p>{getKPIText(value.KPI)}</p>
            )}
            <p>{stData.latest_entries[value.KPI]}</p>
          </div>
        ))}
    </div>
  );
}
