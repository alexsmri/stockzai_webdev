import { getScoreColor, getDashOffset } from '../../utils/functions';

const SCORE_TEXT = 'Score';

function COM_ScoreRadial({ prScore }: { prScore: number }) {
  if (!prScore) return null;
  const color = getScoreColor(prScore);
  const offset = getDashOffset(prScore);
  return (
    <>
      <div className="area-flex-col">
        <svg width="8REM" height="8REM" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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

          <text className="mod-cursor-pointer" x="50%" y="53%" textAnchor="middle">
            {SCORE_TEXT}
          </text>
        </svg>
      </div>
    </>
  );
}

export default COM_ScoreRadial;
