import { useLightbox } from '../context/CTX_Lightbox';
import { formatLargeNumber, getKPIText } from '../utils/functions';
import COM_IndicatorChange from './COM_IndicatorChange';

interface ITF_KPIInfoProps {
  prTableRole:
    | 'income_statement'
    | 'balance_sheet'
    | 'cashflow_statement'
    | 'basics'
    | 'ratios'
    | 'valuation';
  prKey: number | string;
  prInfo: Record<any, any>;
  prValue: number | string;
}

export default function COM_KPIInfo({ prTableRole, prKey, prInfo }: ITF_KPIInfoProps) {
  const { handleLBOpen } = useLightbox();
  return (
    <>
      {prTableRole !== 'basics' ? (
        <div className="area-flex-col mod-gap-none mod-align-right" key={prKey}>
          <div className="area-flex-row mod-space-between mod-w-full mod-padding-none">
            <p
              className="look-button-ghost mod-align-left mod-text-wrap"
              onClick={() => handleLBOpen(prInfo.KPI)}
            >
              {getKPIText(prInfo.KPI)}
            </p>
            <p>{formatLargeNumber(prValue)}</p>
          </div>
          <COM_IndicatorChange prKPI={prInfo.KPI} />
        </div>
      ) : (
        <div key={key} className="area-flex-row mod-space-between">
          <p className="mod-align-left">{getKPIText(prInfo.KPI)}</p>
          <p className="mod-align-right">{formatLargeNumber(prValue)}</p>
        </div>
      )}
    </>
  );
}
