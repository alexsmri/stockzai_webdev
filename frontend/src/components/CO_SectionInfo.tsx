interface InfoSectionProps {
  title: string;
  subitle?: string;
  children: React.ReactNode;
}

function CO_SectionInfo(props: InfoSectionProps) {
  return (
    <>
      <div className="area-flex-col look-div-container mod-gap-l">
        <h3 className="look-text-x5">{props.title}</h3>
        {props.subitle && <p>{props.subitle}</p>}
        <div className="area-flex-wrap mod-space-around mod-gap-l mod-flex-grow-children">{props.children}</div>
      </div>
    </>
  );
}

export default CO_SectionInfo;
