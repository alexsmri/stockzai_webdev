function getColor(score: number): string {
  if (score >= 8) {
    return "#4caf50"; // Green for high scores
  } else if (score >= 5) {
    return "#ff9800"; // Orange for medium scores
  } else {
    return "#f44336"; // Red for low scores
  }
}

function getDashOffset(score: number): string {
  const offset = 264 - score * (234.667 / 10);
  return offset.toString();
}

function getScoreText(scoreKPI: "financial_score" | "valuation_score"): string {
  switch (scoreKPI) {
    case "financial_score":
      return "Financials";
    case "valuation_score":
      return "Valuation";
  }
}

export { getColor, getDashOffset, getScoreText };