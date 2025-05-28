import { getColor, getDashOffset } from "../utils/functions";
import ScoreIcon from "./ScoreIcon";

interface RadialScoreProps {
  score: number; // Score should be between 0 and 10
  scoreKPI: "financial_score" | "valuation_score"; // Optional type for the score
}

function getScoreText(scoreKPI: "financial_score" | "valuation_score"): string {
  switch (scoreKPI) {
    case "financial_score":
      return "Financials";
    case "valuation_score":
      return "Valuation";
  }
}

function RadialScore(props: RadialScoreProps) {
  const color = getColor(props.score);
  const offset = getDashOffset(props.score);
  const text = getScoreText(props.scoreKPI)

  return (
    <svg
      className="svg-score-radial"
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
        x="50%"
        y="53%"
        textAnchor="middle"
      >
        {text}
      </text>

      <g transform="translate(40.5, 0)">
        <ScoreIcon color={color} scoreKPI={props.scoreKPI} />
      </g>
    </svg>
  );
}

export default RadialScore;
