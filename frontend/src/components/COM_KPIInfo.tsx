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
  const utText = getKPIText(prKPI);
  if (!utText) {
    return null;
  }
  const isInteractive = !ROLES_NO_INDICATORS.includes(prTableRole);

  if (isInteractive) {
    return (
      <div className="area-flex-row mod-space-between mod-w-full mod-padding-none">
        <p
          ref={prAttachRef}
          className="look-text-x1 look-text-clickable mod-align-left mod-text-wrap-ellipsis mod-padding-none"
          data-kpi={prKPI}
          onClick={() => handleLBOpen(prKPI)}
        >
          {utText}
        </p>
        <div className="area-flex-row mod-gap-s mod-padding-none">
          <COM_IndicatorChange prKPI={prKPI} />
          <p className="look-text-x1 look-text-normal">{formatLargeNumber(prValue)}</p>{' '}
        </div>
      </div>
    );
  }
  return (
    <div className="area-flex-row mod-space-between mod-w-full mod-padding-none mod-flex-grow-children">
      <p
        className="look-text-x1 look-text-subtle mod-align-left mod-text-wrap-ellipsis"
        data-kpi={prKPI}
      >
        {utText}
      </p>
      <p className="look-text-x1 look-text-normal mod-align-right mod-text-wrap-ellipsis">
        {formatLargeNumber(prValue)}
      </p>
    </div>
  );
}
