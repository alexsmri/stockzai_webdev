interface InfoSectionProps {
  title: string;
  subitle?: string;
  children: React.ReactNode;
}

function SectionInfo(props: InfoSectionProps) {
  return (
    <>
      <div>
        <h3>{props.title}</h3>
        {props.subitle && <p>{props.subitle}</p>}
        <div>{props.children}</div>
      </div>
    </>
  );
}

export default SectionInfo;
