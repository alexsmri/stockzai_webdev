import { formatLargeNumber, getKPIText } from '../utils/functions';

interface ITF_KPIInfoCardProps {
  prTableRole:
    | 'income_statement'
    | 'balance_sheet'
    | 'cashflow_statement'
    | 'basics'
    | 'ratios'
    | 'valuation'
    | 'blobs';
  prKPI: string;
  prValue: number | string | null | undefined;
}

export default function COM_KPIInfoCard({ prKPI, prValue }: ITF_KPIInfoCardProps) {
  const hasValue = prValue !== null && prValue !== undefined && prValue !== '';
  const formattedValue = hasValue ? formatLargeNumber(prValue as number | string) : '-';

  return (
    <div className="area-flex-col mod-align-stretch look-div-subtle" style={{ overflow: 'auto' }}>
      <p className="look-text-x0 look-text-subtle mod-align-left">{getKPIText(prKPI)}</p>
      <p className="look-text-x4 look-text-important mod-align-left mod-text-wrap-gradient">
        {formattedValue}
      </p>
    </div>
  );
}
