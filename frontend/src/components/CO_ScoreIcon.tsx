interface ScoreIconProps {
  color: string; // Color for the icon
  scoreKPI: "financial_score" | "valuation_score"; // Type for the score
  width?: string;
  height?: string;
}

import FinancialScore from "@/assets/media/ICON_Financial.svg?react";
import ValuationScore from "@/assets/media/ICON_Valuation.svg?react";

const icons = {
  financial_score: FinancialScore,
  valuation_score: ValuationScore,
};

function ScoreIcon({
  color,
  scoreKPI,
  width = "20%",
  height = "20%",
}: ScoreIconProps) {
  const IconComponent = icons[scoreKPI];
  return (
    <IconComponent
      style={{
        color,
      }}
      width={width}
      height={height}
    ></IconComponent>
  );
}

export default ScoreIcon;
// This component renders an SVG icon based on the score type and color provided.
