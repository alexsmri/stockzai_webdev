import { useLightbox } from '../context/CTX_Lightbox';
import { formatLargeNumber, getKPIText } from '../utils/functions';
import COM_IndicatorChange from './COM_IndicatorChange';

const ROLES_NO_INDICATORS = ['basics', 'blobs'];

interface ITF_KPIInfoProps {
  prTableRole:
    | 'income_statement'
    | 'balance_sheet'
    | 'cashflow_statement'
    | 'basics'
    | 'ratios'
    | 'valuation'
    | 'blobs';
  prKPI: string;
  prValue: number | string;
}

export default function COM_KPIInfo({ prTableRole, prKPI, prValue }: ITF_KPIInfoProps) {
  const { handleLBOpen } = useLightbox();
  return (
    <>
      {!ROLES_NO_INDICATORS.includes(prTableRole) ? (
        <div className="area-flex-col mod-gap-none mod-align-right" key={prKPI}>
          <div className="area-flex-row mod-space-between mod-w-full mod-padding-none">
            <p
              className="look-button-ghost mod-align-left mod-text-wrap"
              onClick={() => handleLBOpen(prKPI)}
            >
              {getKPIText(prKPI)}
            </p>
            <p>{formatLargeNumber(prValue)}</p>
          </div>
          <COM_IndicatorChange prKPI={prKPI} />
        </div>
      ) : (
        <div key={prKPI} className="area-flex-row mod-space-between">
          <p className="mod-align-left">{getKPIText(prKPI)}</p>
          <p className="mod-align-right">{formatLargeNumber(prValue)}</p>
        </div>
      )}
    </>
  );
}
