import { getColor, getDashOffset } from "../utils/functions";
import ScoreIcon from "./ScoreIcon";
import { useCompanyStoreSync } from "../hooks/hooks";
import { useCompanyStore } from "../context/CompanyStoreContext";
import type { CompanyAPIResponse } from "../types/types";
import { useState } from "react";

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

function ScoreRadial({ KPI }: ScoreRadialProps) {
  const store = useCompanyStore();
  const [data, setData] = useState<CompanyAPIResponse | null>(null);

  useCompanyStoreSync(store, setData);

  if (!data || !data.latest_entries[KPI]) return null;
  const score = data.latest_entries[KPI];
  const color = getColor(score);
  const offset = getDashOffset(score);
  const text = getScoreText(KPI);
  return (
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
        stroke={color}
        strokeWidth="2%"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="234.667"
        strokeDashoffset={offset}
        transform="rotate(-70 50 50)"
      ></circle>

      <text
        className="text-[10px] cursor-pointer"
        x="50%"
        y="53%"
        textAnchor="middle"
      >
        {text}
      </text>

      <g transform="translate(40, 0)">
        <ScoreIcon color={color} scoreKPI={KPI} />
      </g>
    </svg>
  );
}

export default ScoreRadial;
