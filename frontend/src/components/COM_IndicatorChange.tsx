import { getChangeColor, formatLargeNumber } from "../utils/functions";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useCompanyStore } from "../context/CTX_CompanyStore";
import { useState } from "react";
import COM_IconColor from "./COM_IconColor";
import { getChangeDivClass } from "../utils/functions";

function COM_IndicatorChange({ KPI, prShowDiv }: {KPI: string, prShowDiv?: boolean}) {
  const store = useCompanyStore();
  const [stData, setStData] = useState<Record<string, any> | null>(null);
  const [stMode, setStMode] = useState< "abs" | "cha">("cha");

  useCompanyStoreSync(store, setStData);

  if (!stData || !stData.company_intel[KPI]) return null;
  const utKPIIntel: Record<any, number> = stData.company_intel[KPI];
  const utDates = Object.keys(utKPIIntel).sort((a, b) => Date.parse(a) > Date.parse(b) ? -1 : 1)
  const utChildrenEmpty = (
    <div 
        className="area-flex-row mod-gap-none mod-padding-none" 
      >
        <p>-</p>
        <p>--</p>
      </div>
  )
  if (utDates.length < 2) return (
    <>
    {prShowDiv ? 
      <div className={getChangeDivClass(0)}>
        {utChildrenEmpty}
      </div>
      : 
      utChildrenEmpty
    }
    </>
  );
  
  const utAbsolute = utKPIIntel[utDates[0]] - utKPIIntel[utDates[1]]
  const utChange = (utAbsolute / utKPIIntel[utDates[0]]) * 100
  const utColor = getChangeColor(utChange)
  const utDisplayChange = `${Math.round(isFinite(utChange) ? utChange : -100)}%`

  const utChildren = (
      <div className="area-flex-row mod-gap-none mod-padding-none">
        <p 
          className="mod-cursor-pointer"
          style={{ color: utColor }}
          onClick={() => setStMode(stMode === "abs" ? "cha": "abs")}
        > 
          {stMode === "cha" ? utDisplayChange : formatLargeNumber(utAbsolute)}
        </p>
        <COM_IconColor 
          prColor={utColor} 
          prPath={"ICON_Triangle"} 
          prWidth="1.2rem" 
          prHeight="1.2rem"
          prRotation={utChange < 0 ? "180" : "0"}
        />
      </div>
  )
  return (
    <>
    {prShowDiv ? 
      <div className={getChangeDivClass(utChange)}>
        {utChildren}
      </div>
      : 
      utChildren
    }
    </>
  );
}

export default COM_IndicatorChange;
