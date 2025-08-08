import { formatLargeNumber, getKPIText } from '../../utils/functions';

const TYPE_CLASS_LOOKUP = {
  bar: 'area-flex-row',
  table: 'area-flex-row mod-space-between',
};
interface ITF_KPIInfoProps {
  prKPI: string;
  prValue: number | string;
  prType?: 'bar' | 'table';
}

export default function DCOM_KPIInfo({ prKPI, prValue, prType = 'table' }: ITF_KPIInfoProps) {
  return (
    <div key={prKPI} className={TYPE_CLASS_LOOKUP[prType]}>
      <p className="mod-align-left">{getKPIText(prKPI)}</p>
      <p className="mod-align-right">{formatLargeNumber(prValue)}</p>
    </div>
  );
}
