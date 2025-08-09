import { formatLargeNumber, getKPIText } from '../../utils/functions';
type TYP_KPIObject = {
  value: number | string;
  text?: string;
  color?: string;
};

const TYPE_CLASS_LOOKUP = {
  bar: 'area-flex-row',
  table: 'area-flex-row mod-space-between mod-padding-none',
} as const;

type TYP_KPIType = keyof typeof TYPE_CLASS_LOOKUP;

interface ITF_KPIInfoProps {
  prKPI: string;
  prValue: number | string | TYP_KPIObject | null | undefined;
  prType?: TYP_KPIType;
}

function isKPIObject(v: unknown): v is TYP_KPIObject {
  return !!v && typeof v === 'object' && !Array.isArray(v) && 'value' in (v as any);
}

export default function DCOM_KPIInfo({ prKPI, prValue, prType = 'table' }: ITF_KPIInfoProps) {
  let color: string | undefined;
  let text: string | undefined;
  let value: number | string | null | undefined | TYP_KPIObject = prValue;

  if (isKPIObject(prValue)) {
    color = prValue.color;
    text = prValue.text;
    value = prValue.value;
  }

  if (value == null) return null;

  return (
    <div className="area-flex-col mod-gap-none mod-padding-none mod-flex-grow-children">
      <div className={TYPE_CLASS_LOOKUP[prType]}>
        <p className="mod-align-left">{getKPIText(prKPI)}</p>
        <p className="mod-align-right" style={{ color }}>
          {formatLargeNumber(value)}
        </p>
      </div>
      {text && <p className="look-text-x0">{text}</p>}
    </div>
  );
}
