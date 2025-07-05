import { getChangeColor, formatLargeNumber } from "../utils/functions";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useCompanyStore } from "../context/CTX_CompanyStore";
import { useState } from "react";
import COM_IconColor from "./COM_IconColor";

function COM_IndicatorChange({ KPI }: {KPI: string}) {
  const store = useCompanyStore();
  const [stData, setStData] = useState<Record<string, any> | null>(null);
  const [stMode, setStMode] = useState< "abs" | "cha">("cha");

  useCompanyStoreSync(store, setStData);

  if (!stData || !stData.company_intel[KPI]) return null;
  const utKPIIntel: Record<any, number> = stData.company_intel[KPI];
  const utDates = Object.keys(utKPIIntel).sort((a, b) => Date.parse(a) > Date.parse(b) ? -1 : 1)
  if (utDates.length < 2) return (
    <div 
        className="area-flex-row" 
      >
        <p>-</p>
        <p>--</p>
      </div>
  );
  console.log(utDates[0], utDates[1])
  const utAbsolute = utKPIIntel[utDates[0]] - utKPIIntel[utDates[1]]
  const utChange = (utAbsolute / utKPIIntel[utDates[0]]) * 100
  const utColor = getChangeColor(utChange)
  const utDisplayChange = `${Math.round(utChange)}%`
  return (
    <>
      <div className="area-flex-row">
        <COM_IconColor 
          prColor={utColor} 
          prPath={"ICON_Triangle"} 
          prWidth="20%" 
          prHeight="20%"
        />
        <p 
          className="mod-cursor-pointer"
          onClick={() => setStMode(stMode === "abs" ? "cha": "abs")}
        >
          {stMode === "cha" ? utDisplayChange : formatLargeNumber(utAbsolute)}
        </p>
      </div>
    </>
  );
}

export default COM_IndicatorChange;
