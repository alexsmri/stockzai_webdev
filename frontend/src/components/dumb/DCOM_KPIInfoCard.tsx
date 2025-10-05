interface ITF_KPIInfoCardProps {
  prLabel?: string;
  prKPI?: string;
  prValue: number | string | null | undefined;
}

export default function DCOM_KPIInfoCard({ prLabel, prValue }: ITF_KPIInfoCardProps) {
  return (
    <div className="area-flex-col mod-align-stretch look-div-subtle">
      {prLabel && <p className="look-text-x0 look-text-subtle mod-align-left">{prLabel}</p>}
      <p className="look-text-x4 look-text-important mod-align-left">{prValue}</p>
    </div>
  );
}
