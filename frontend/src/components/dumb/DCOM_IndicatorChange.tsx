import { getChangeColor, getChangeDivClass } from '../../utils/functions';
import COM_IconColor from '.././COM_IconColor';

const KPI_SCORING_ZERO = -1;

function COM_IndicatorChange({
  prChange,
  prKPIScoring = 1,
  prShowDiv = false,
}: {
  prChange: number | null;
  prKPIScoring?: 0 | 1 | null;
  prShowDiv?: boolean;
}) {
  if (!prChange) return null;

  const utKPIScoring =
    typeof prKPIScoring === 'number' ? (prKPIScoring === 0 ? KPI_SCORING_ZERO : 1) : 1;
  const utChange = prChange * 100;
  const utColor = getChangeColor(utChange * utKPIScoring);
  const utDisplayChange = `${Math.round(isFinite(utChange) ? utChange : -100)}%`;

  const utChildren = (
    <div className="area-flex-row mod-gap-none mod-padding-none">
      <p className="mod-cursor-pointer" style={{ color: utColor }}>
        {utDisplayChange}
      </p>
      <COM_IconColor
        prColor={utColor}
        prPath={'ICON_Triangle'}
        prWidth="1.2rem"
        prHeight="1.2rem"
        prRotation={utChange < 0 ? '180' : '0'}
      />
    </div>
  );
  return (
    <>
      {prShowDiv ? (
        <div className={getChangeDivClass(utChange * utKPIScoring)}>{utChildren}</div>
      ) : (
        utChildren
      )}
    </>
  );
}

export default COM_IndicatorChange;
