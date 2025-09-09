import { LANDINGPAGE_BUTTON_LINKS } from '../../constants';
import { PRV_WinnerStore } from '../../context/CTX_WinnerStore';
import COM_Winners from '../COM_Winners';

export default function COM_SectionTrust(prLoggedIn: { prLoggedIn: boolean }) {
  const utLink = prLoggedIn ? LANDINGPAGE_BUTTON_LINKS.login : LANDINGPAGE_BUTTON_LINKS.anonymous;
  return (
    <div className="area-grid-col-2a mod-padding-hero">
      <div className="area-flex-col look-div-backlight mod-padding-l">
        <p className="look-text-x5 look-text-hero mod-left">Scores to leverage.</p>
        <p className="look-text-subtle mod-left">See last week's best performers</p>
        <a href={utLink} className="look-button-primary mod-left" style={{ flexGrow: 0 }}>
          {prLoggedIn ? 'Search Tickers' : 'Sign Up'}
        </a>
        <div className="mod-left">
          <PRV_WinnerStore args={[]}>
            <COM_Winners />
          </PRV_WinnerStore>
        </div>
      </div>
      <div className="area-flex-col mod-padding-none mod-flex-grow-children mod-align-stretch">
        <div className="area-flex-col look-div-backlight mod-padding-l">
          <p className="look-text-x5 look-text-hero mod-left">Data to browse.</p>
          <p className="look-text-subtle mod-left">
            stockz.ai covers 20k+ companies and scores all their key financial & valuation ratios
            against their peers.
          </p>
        </div>
        <div className="area-flex-col look-div-backlight mod-padding-l">
          <p className="look-text-x5 look-text-hero mod-left">100% Free.</p>
          <p className="look-text-subtle mod-left">
            100% free during Beta. No ads, no ‘get-rich-quick’ promises. Just clean data and
            clarity.
          </p>
        </div>
      </div>
    </div>
  );
}
