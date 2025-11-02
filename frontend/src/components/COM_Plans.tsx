import type { ReactNode } from 'react';
import { scale } from '../utils/functions';
import { COM_ButtonBuy } from './COM_ButtonBuy';

interface PlansProps {
  prButtonLabel?: string;
  prOnAction?: () => void;
  prDisabled?: boolean;
  prIsLoading?: boolean;
  prFooter?: ReactNode;
}

function COM_Plans({ prButtonLabel, prFooter }: PlansProps) {
  const liStyle = { marginBottom: scale(0.5) };

  return (
    <div className="area-flex-col mod-align-left">
      <h2 className="look-text-x3 mod-left look-priority-medium">Pro</h2>
      <h2 className="look-text-x3 mod-align-left look-priority-low">
        Unlock everything for just <br />
        <span className="look-priority-high">$10</span>/one-time
      </h2>
      <ul className="mod-padding-s">
        <li className="look-text-x1 look-priority-normal" style={liStyle}>
          20.000+ companies
        </li>
        <li className="look-text-x1 look-priority-normal" style={liStyle}>
          Sector Leaderboards
        </li>
        <li className="look-text-x1 look-priority-normal" style={liStyle}>
          Access to all KPIs
        </li>
      </ul>
      <COM_ButtonBuy prPlanKey="pro_monthly" prButtonLabel={prButtonLabel} />
      {prFooter ? <div className="mod-margin-t-m">{prFooter}</div> : null}
    </div>
  );
}

export default COM_Plans;
