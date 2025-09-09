import { LANDINGPAGE_BUTTON_LINKS } from '../../constants';
import COM_Winners from '../COM_Winners';

export default function COM_SectionTrust(prLoggedIn: { prLoggedIn: boolean }) {
  const utLink = prLoggedIn ? LANDINGPAGE_BUTTON_LINKS.login : LANDINGPAGE_BUTTON_LINKS.anonymous;
  return (
    <div className="area-grid-auto">
      <div className="area-flex-col look-div-backlight mod-align-left">
        <p className="look-text-x5 look-text-hero mod-align-left">Scores to leverage.</p>
        <p className="look-text-subtle">See last week's best performers</p>
        <a href={utLink} className="look-button-primary">
          {prLoggedIn ? 'Search Tickers' : 'Sign Up'}
        </a>
        <COM_Winners />
      </div>
      <div className="area-flex-col mod-padding-none">
        <div className="area-flex-col look-div-backlight mod-align-left">
          <p className="look-text-x5 look-text-hero mod-align-left">Data to browse.</p>
          <p className="look-text-subtle">
            stockz.ai covers 20k+ companies and scores all their key financial & valuation ratios
            against their peers.
          </p>
        </div>
        <div className="area-flex-col look-div-backlight mod-align-left">
          <p className="look-text-x5 look-text-hero mod-align-left">100% Free.</p>
          <p className="look-text-subtle">
            100% free during Beta. No ads, no ‘get-rich-quick’ promises. Just clean data and
            clarity.
          </p>
        </div>
      </div>
    </div>
  );
}
