import ICON_Crown from '../assets/media/ICON_Crown.svg?react';
import { scale } from '../utils/functions';
import { PAYWALL_ENABLED } from '../constants';

interface PI_PaywallSearchResult {
  prIsRedacted: boolean;
}

export default function COM_PaywallSearchResult({ prIsRedacted }: PI_PaywallSearchResult) {
  if (!PAYWALL_ENABLED || !prIsRedacted) {
    return null;
  }

  return (
    <div
      className="area-flex-row mod-justify-end"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        paddingRight: scale(3),
      }}
    >
      <span className="look-text-x1 look-priority-medium">Get Pro</span>
      <ICON_Crown
        style={{ width: scale(1), height: 'auto' }}
        fill="currentColor"
        stroke="transparent"
      />
    </div>
  );
}
