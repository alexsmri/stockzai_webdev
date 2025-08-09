import DCOM_KPIInfo from './DCOM_KPIInfo';

const TYPE_CLASS_LOOKUP = {
  bar: 'look-div-container area-flex-wrap',
  table: 'look-div-container area-flex-col mod-align-stretch',
};

export default function DCOM_TableInfo({
  prTitle,
  prData,
  prType = 'table',
}: {
  prTitle: string;
  prData: Record<string, string | number | Record<string, any>>;
  prType: 'bar' | 'table';
}) {
  return (
    <>
      <div className="area-flex-col">
        <h3 className="look-text-x2">{prTitle}</h3>
        <div className={TYPE_CLASS_LOOKUP[prType]}>
          {Object.entries(prData).map(([key, value]) => (
            <DCOM_KPIInfo prKPI={key} prValue={value} prType={prType} />
          ))}
        </div>
      </div>
    </>
  );
}
