export default function COM_MenuLegal({
  prLegalPageDict,
  prLegalNameDict,
  prCurrentPage,
}: {
  prLegalPageDict: Record<string, string>;
  prLegalNameDict: Record<string, string>;
  prCurrentPage: string;
}) {
  console.log(`Menu: ${prCurrentPage}`);
  return (
    <>
      <div className="area-flex-col mod-pos-sti mod-prevent-growth mod-align-left">
        <h4>
          <strong>Other Documents</strong>
        </h4>
        {Object.keys(prLegalPageDict).map((key) => {
          if (key === prCurrentPage) {
            return (
              <a
                className="look-button-ghost"
                style={{ color: 'var(--color-green)', fontWeight: 600 }}
                href={prLegalPageDict[key]}
              >
                {prLegalNameDict[key]}
              </a>
            );
          } else {
            return (
              <a className="look-button-ghost" href={prLegalPageDict[key]}>
                {prLegalNameDict[key]}
              </a>
            );
          }
        })}
      </div>
    </>
  );
}
