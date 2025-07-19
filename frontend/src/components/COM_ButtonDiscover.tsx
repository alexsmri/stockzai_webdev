export function COM_ButtonDiscover({ prHref }: { prHref: string }) {
  return (
    <div className="area-flex-row">
      <a className="look-button-ghost look-button-hover-padding" href={prHref}>
        Discover
      </a>
      <p className="look-button-ghost">{'>'}</p>
    </div>
  );
}
