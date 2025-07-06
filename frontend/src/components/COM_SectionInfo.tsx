import COM_IndicatorChange from "./COM_IndicatorChange";

interface InfoSectionProps {
  title: string;
  subitle?: string;
  children: React.ReactNode;
  prShowChange?: boolean;
}

function COM_SectionInfo(props: InfoSectionProps) {
  const prShowChange = props.prShowChange ? true : false
  return (
    <>
      <div className="area-flex-col look-div-container mod-gap-l">
        <div className="area-flex-row">
          <h3 className="look-text-x5">{props.title}</h3>
          { prShowChange && 
            <COM_IndicatorChange KPI="financial_score" prShowDiv={true}/>
          }
        </div>
        {props.subitle && <p>{props.subitle}</p>}
        <div className="area-flex-wrap mod-space-around mod-gap-l mod-flex-grow-children">{props.children}</div>
      </div>
    </>
  );
}

export default COM_SectionInfo;
