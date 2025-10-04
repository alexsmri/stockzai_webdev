import COM_IndicatorChange from './COM_IndicatorChange';

const ROLE_CHANGE_KPIS: Record<string, string> = {
  'Scores.': 'totalScore',
};

interface InfoSectionProps {
  title: string;
  subitle?: string;
  children: React.ReactNode;
  prShowChange?: boolean;
}

function COM_SectionInfo(props: InfoSectionProps) {
  const prShowChange = props.prShowChange ? true : false;
  return (
    <>
      <div className="area-flex-col mod-align-stretch look-div-subtle mod-gap-l">
        <div className="area-flex-row mod-space-between">
          <h3 className="look-text-x0 look-text-subtle mod-align-left">{props.title}</h3>
          {prShowChange && props.title && (
            <COM_IndicatorChange prKPI={ROLE_CHANGE_KPIS[props.title]} prShowDiv={true} />
          )}
        </div>
        {props.subitle && <p>{props.subitle}</p>}
        <div className="area-flex-wrap mod-space-around mod-gap-l mod-flex-grow-children mod-center">
          {props.children}
        </div>
      </div>
    </>
  );
}

export default COM_SectionInfo;
