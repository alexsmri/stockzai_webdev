import DCOM_KPIInfo from './DCOM_KPIInfo';

export default function DCOM_TableInfo({
  prTitle,
  prData,
}: {
  prTitle: string;
  prData: Record<string, string | number>;
}) {
  return (
    <>
      <div className={'area-flex-col'}>
        <h3 className="look-text-x2">{prTitle}</h3>
        <div className="look-div-container">
          {Object.entries(prData).map(([key, value]) => (
            <DCOM_KPIInfo prKPI={key} prValue={value} />
          ))}
        </div>
      </div>
    </>
  );
}
