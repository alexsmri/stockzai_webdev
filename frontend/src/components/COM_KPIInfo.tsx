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
        <div className="area-flex-row mod-space-between" key={prKPI}>
          <p
            className="look-text-x1 look-text-clickable mod-align-left mod-text-wrap-gradient"
            data-kpi={prKPI}
            onClick={() => handleLBOpen(prKPI)}
          >
            {getKPIText(prKPI)}
          </p>
          <div className="area-flex-row mod-gap-s mod-padding-none">
            <p className="look-text-x1 look-text-normal">{formatLargeNumber(prValue)}</p>
            <COM_IndicatorChange prKPI={prKPI} />
          </div>
        </div>
      ) : (
        <div key={prKPI} className="area-flex-row mod-space-between">
          <p className="look-text-x1 look-text-subtle mod-align-left" data-kpi={prKPI}>
            {getKPIText(prKPI)}
          </p>
          <p className="look-text-x1 look-text-normal mod-align-right">
            {formatLargeNumber(prValue)}
          </p>
        </div>
      )}
    </>
  );
}
