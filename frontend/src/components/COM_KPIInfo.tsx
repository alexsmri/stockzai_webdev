import { useLightbox } from '../context/CTX_Lightbox';
import type { RefCallback } from 'react';
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
  prAttachRef?: RefCallback<HTMLParagraphElement>;
}

export default function COM_KPIInfo({
  prTableRole,
  prKPI,
  prValue,
  prAttachRef,
}: ITF_KPIInfoProps) {
  const { handleLBOpen } = useLightbox();
  const isInteractive = !ROLES_NO_INDICATORS.includes(prTableRole);

  if (isInteractive) {
    return (
      <div className="area-flex-row mod-space-between">
        <p
          ref={prAttachRef}
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
    );
  }

  return (
    <div className="area-flex-row mod-space-between">
      <p className="look-text-x1 look-text-subtle mod-align-left" data-kpi={prKPI}>
        {getKPIText(prKPI)}
      </p>
      <p className="look-text-x1 look-text-normal mod-align-right">
        {formatLargeNumber(prValue)}
      </p>
    </div>
  );
}
