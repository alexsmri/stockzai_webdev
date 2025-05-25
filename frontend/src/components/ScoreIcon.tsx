interface ScoreIconProps {
  color: string; // Color for the icon
  scoreKPI: "financial_score" | "valuation_score"; // Type for the score
}

import FinancialScore from "../assets/react.svg?react";
import ValuationScore from "../assets/react.svg?react";

const icons = {
  financial_score: FinancialScore,
  valuation_score: ValuationScore,
};

function ScoreIcon(props: ScoreIconProps) {
  const IconComponent = icons[props.scoreKPI];
  const color = props.color;
  return (
    <IconComponent
      style={{
        color, // This will set the color of the SVG paths if they use currentColor
      }}
      // Clone each path element and override color
    >
      {/* If SVGs are well-structured, you could also style them via CSS */}
      {/* OR use JS to map over children and override fill dynamically */}
    </IconComponent>
  );
}

export default ScoreIcon;
// This component renders an SVG icon based on the score type and color provided.
