import { getChangeColor, formatLargeNumber, getKPIScoring } from '../utils/functions';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useState } from 'react';
import COM_IconColor from './COM_IconColor';
import { getChangeDivClass } from '../utils/functions';

type CompanyIntelSeries = Record<string, number>;
type CompanyStoreRecord = {
  company_intel?: Record<string, CompanyIntelSeries>;
};

type KPICatalog = Record<string, unknown>;

function COM_IndicatorChange({ prKPI, prShowDiv }: { prKPI: string; prShowDiv?: boolean }) {
  const store = useCompaniesStore();
  const [companyData, setCompanyData] = useState<CompanyStoreRecord | null>(null);
  const [kpiCatalog, setKpiCatalog] = useState<KPICatalog | null>(null);
  const [mode, setMode] = useState<'abs' | 'cha'>('cha');

  useCompaniesStoreSync<CompanyStoreRecord>(store, 'PropertyCompanyProfile', setCompanyData);
  useCompaniesStoreSync<KPICatalog>(store, 'PropertyCompanyKPIs', setKpiCatalog);

  const utKPIIntel = companyData?.company_intel?.[prKPI];
  if (!utKPIIntel || !kpiCatalog) return null;
  const utKPIScoring = getKPIScoring(prKPI, kpiCatalog);
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

  const utNew = utKPIIntel[utDates[0]];
  let utOld = utKPIIntel[utDates[1]];
  for (let i = 1; i < utDates.length; i++) {
    if (utKPIIntel[utDates[i]] !== utNew) {
      utOld = utKPIIntel[utDates[i]];
      break;
    }
  }
  const utAbsolute = utNew - utOld;
  const utChange = (utAbsolute / Math.abs(utOld)) * 100;
  const utColor = getChangeColor(utChange * utKPIScoring);
  const utDisplayChange = `${Math.round(isFinite(utChange) ? utChange : -100)}%`;

  const utChildren = (
    <div className="area-flex-row mod-gap-none mod-padding-none">
      <p
        className="mod-cursor-pointer"
        style={{ color: utColor }}
        onClick={() => setMode(mode === 'abs' ? 'cha' : 'abs')}
      >
        {mode === 'cha' ? utDisplayChange : formatLargeNumber(utAbsolute)}
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
