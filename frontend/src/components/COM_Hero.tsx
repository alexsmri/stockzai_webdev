export default function COM_Hero({
  children,
  prFlex = false,
}: {
  children: React.ReactNode;
  prFlex?: boolean;
}) {
  const utClass = prFlex
    ? 'area-flex-col mod-padding-hero mod-align-stretch mod-center'
    : 'area-flex-col mod-padding-hero mod-center';
  return <div className={utClass}>{children}</div>;
}
