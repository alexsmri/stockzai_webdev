import { formatLargeNumber, getKPIText } from '../../utils/functions';
interface ITF_KPIInfoProps {
  prKPI: string;
  prValue: number | string;
}

export default function DCOM_KPIInfo({ prKPI, prValue }: ITF_KPIInfoProps) {
  return (
    <div key={prKPI} className="area-flex-row mod-space-between">
      <p className="mod-align-left">{getKPIText(prKPI)}</p>
      <p className="mod-align-right">{formatLargeNumber(prValue)}</p>
    </div>
  );
}
