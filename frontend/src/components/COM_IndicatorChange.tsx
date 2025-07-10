import { getChangeColor, formatLargeNumber } from '../utils/functions';
import { useCompanyStoreSync } from '../hooks/hooks';
import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useState } from 'react';
import COM_IconColor from './COM_IconColor';
import { getChangeDivClass } from '../utils/functions';
import { useKPIStore } from '../context/CTX_KPIStore';
import { useKPIStoreSync } from '../hooks/hooks';

const KPI_SCORING_ZERO = -1;

function COM_IndicatorChange({ prKPI, prShowDiv }: { prKPI: string; prShowDiv?: boolean }) {
  const utCompanyStore = useCompanyStore();
  const utKPIStore = useKPIStore();
  const [stData, setStData] = useState<Record<string, any> | null>(null);
  const [stMode, setStMode] = useState<'abs' | 'cha'>('cha');
  const [stKPIs, setStKPIs] = useState<Record<string, any> | null>(null);

  useCompanyStoreSync(utCompanyStore, setStData);
  useKPIStoreSync(utKPIStore, setStKPIs);

  if (!stData || !stData.company_intel[prKPI] || !stKPIs) return null;
  const utKPIId = Object.keys(stKPIs).find((key) => {
    if (stKPIs[key]['KPI'] === prKPI) return key;
  });
  const utKPIInfo = stKPIs[utKPIId as string];
  const utKPIScoring =
    typeof utKPIInfo['scoring'] === 'number'
      ? utKPIInfo['scoring'] === 0
        ? KPI_SCORING_ZERO
        : 1
      : 1;

  typeof utKPIScoring === 'number' && console.log(prKPI, utKPIScoring);
  const utKPIIntel: Record<any, number> = stData.company_intel[prKPI];
  const utDates = Object.keys(utKPIIntel).sort((a, b) => (Date.parse(a) > Date.parse(b) ? -1 : 1));
  const utChildrenEmpty = (
    <div className="area-flex-row mod-gap-none mod-padding-none">
      <p>-</p>
      <p>--</p>
    </div>
  );
  if (utDates.length < 2)
    return (
      <>
        {prShowDiv ? (
          <div className={getChangeDivClass(0)}>{utChildrenEmpty}</div>
        ) : (
          utChildrenEmpty
        )}
      </>
    );

  const utOld = utKPIIntel[utDates[1]];
  const utNew = utKPIIntel[utDates[0]];
  const utAbsolute = utNew - utOld;
  const utChange = (utAbsolute / Math.abs(utOld)) * 100;
  const utColor = getChangeColor(utChange * utKPIScoring);
  const utDisplayChange = `${Math.round(isFinite(utChange) ? utChange : -100)}%`;

  const utChildren = (
    <div className="area-flex-row mod-gap-none mod-padding-none">
      <p
        className="mod-cursor-pointer"
        style={{ color: utColor }}
        onClick={() => setStMode(stMode === 'abs' ? 'cha' : 'abs')}
      >
        {stMode === 'cha' ? utDisplayChange : formatLargeNumber(utAbsolute)}
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
