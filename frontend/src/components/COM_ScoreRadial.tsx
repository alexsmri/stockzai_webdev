import { getColor, getDashOffset } from "../utils/functions";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useCompanyStore } from "../context/CTX_CompanyStore";
import type { CompanyAPIResponse } from "../types/types";
import { useState } from "react";
import COM_IconColor from "./COM_IconColor";

interface ScoreRadialProps {
  KPI: "financial_score" | "valuation_score"; // Optional type for the score
}

function getScoreText(scoreKPI: "financial_score" | "valuation_score"): string {
  switch (scoreKPI) {
    case "financial_score":
      return "Financials";
    case "valuation_score":
      return "Valuation";
  }
}

function COM_ScoreRadial({ KPI }: ScoreRadialProps) {
  const store = useCompanyStore();
  const [data, setData] = useState<CompanyAPIResponse | null>(null);

  useCompanyStoreSync(store, setData);

  if (!data || !data.latest_entries[KPI]) return null;
  const score = data.latest_entries[KPI];
  const color = getColor(score);
  const offset = getDashOffset(score);
  const text = getScoreText(KPI);
  return (
    <>
    <div className="area-flex-col">
    <svg
      width="9VW"
      height="9VW"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="rgba(255, 255, 255, 0.04)"
        strokeWidth="3%"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="264"
        strokeDashoffset="0"
        transform="rotate(-70 50 50)"
      ></circle>
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke={color}
        strokeWidth="3%"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="264"
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      ></circle>

      <text
        className="text-[10px] cursor-pointer"
        x="50%"
        y="53%"
        textAnchor="middle"
      >
        {text}
      </text>

      
    </svg>
    <div className="area-flex-wrap">
    <COM_IconColor prColor={color} prPath={"ICON_Triangle"} prWidth="34%" prHeight="34%"/>
    <p>3%</p>
    </div>
    </div>
    </>
  );
}

export default COM_ScoreRadial;
