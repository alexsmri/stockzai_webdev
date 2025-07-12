export default function COM_TableOfContents({
  prContentDict,
}: {
  prContentDict: Record<string, string>;
}) {
  return (
    <>
      <div className="area-flex-col look-div-container mod-pos-sti mod-prevent-growth mod-align-left">
        <h4>
          <strong>Table of Contents</strong>
        </h4>
        {Object.keys(prContentDict).map((key) => {
          return (
            <a className="look-button-ghost" href={key}>
              {prContentDict[key]}
            </a>
          );
        })}
      </div>
    </>
  );
}
