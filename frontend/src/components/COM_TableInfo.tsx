import { useState } from "react";
import { useCompanyStore } from "../context/CTX_CompanyStore";
import { formatLargeNumber } from "../utils/functions";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useKPIStore } from "../context/CTX_KPIStore";
import { useKPIStoreSync } from "../hooks/hooks";
import { getKPIText } from "../utils/functions";
import { getRoleText } from "../utils/functions";
import { useLightbox } from "../context/CTX_Lightbox";
import COM_IndicatorChange from "./COM_IndicatorChange";

interface PI_TableInfo {
  prTableRole: "income_statement" | "balance_sheet" | "cashflow_statement" | "basics" | "ratios" | "valuation";
}

export default function COM_TableInfo({ prTableRole }: PI_TableInfo) {
  const utCompanyStore = useCompanyStore();
  const utKpiStore = useKPIStore();
  const utText = getRoleText(prTableRole)
  const [stKPIs, setStKPIs] = useState<Record<string, any> | null>(null);
  const [stData, setStData] = useState<Record<string, any> | null>(null);

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
    <>
    <div className="area-flex-col">
    <h3 className="look-text-x2">{utText}</h3>
    <div className="look-div-container">
      {Object.entries(table_entries)
        .filter(([_, value]) =>
          Object.keys(stData.latest_entries).includes(value.KPI)
        )
        .map(([key, value]) => (
            <>
            {prTableRole !== "basics" ? (
                <div className="area-flex-col mod-gap-none mod-align-right" key={key}>
                  <div className="area-flex-row mod-space-between mod-w-full mod-padding-none">
                    <p className="look-button-ghost" onClick={() => handleLBOpen(value.KPI)}>
                      {getKPIText(value.KPI)}
                    </p>
                    <p>{formatLargeNumber(stData.latest_entries[value.KPI])}</p>
                  </div>
                  <COM_IndicatorChange KPI={value.KPI}/>
                </div>
            ) : (
              <div key={key} className="area-flex-row mod-space-between">
                <p>{getKPIText(value.KPI)}</p>
                <p>{stData.latest_entries[value.KPI]}</p>
              </div>
            )}
            </>
        ))}
    </div>
    </div>
    </>
  );
}
