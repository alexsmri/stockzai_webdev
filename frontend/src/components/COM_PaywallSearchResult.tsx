import ICON_Crown from '../assets/media/ICON_Crown.svg?react';

interface PI_PaywallSearchResult {
  prIsRedacted: boolean;
}

export default function COM_PaywallSearchResult({ prIsRedacted }: PI_PaywallSearchResult) {
  if (!prIsRedacted) {
    return null;
  }

  return (
    <div
      className="area-flex-row mod-justify-end"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        paddingRight: 'calc(var(--default-font-size)*3)',
      }}
    >
      <span className="look-text-x1 look-priority-medium">Get Pro</span>
      <ICON_Crown
        style={{ width: 'calc(var(--default-font-size) * 1)', height: 'auto' }}
        fill="currentColor"
        stroke="transparent"
      />
    </div>
  );
}
