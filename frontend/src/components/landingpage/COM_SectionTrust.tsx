import { LANDINGPAGE_BUTTON_LINKS, MOBILE_BREAKPOINT } from '../../constants';
import { PRV_WinnerStore } from '../../context/CTX_WinnerStore';
import { useWindowDimensions } from '../../hooks/hooks';
import COM_Winners from '../COM_Winners';
import IMG_TableRatios from '../../assets/media/IMG_TableRatios.png';

const SECTION_CLASS_LOOKUP = {
  mobile: 'area-flex-col mod-padding-hero mod-align-stretch',
  desktop: 'area-grid-col-2a mod-padding-hero',
};

const SECONDARY_CLASS_LOOKUP = {
  mobile: 'area-grid-auto mod-padding-none',
  desktop: 'area-flex-col mod-padding-none mod-flex-grow-children mod-align-stretch',
};

export default function COM_SectionTrust({ prLoggedIn }: { prLoggedIn: boolean | null }) {
  const utLink = prLoggedIn ? LANDINGPAGE_BUTTON_LINKS.login : LANDINGPAGE_BUTTON_LINKS.anonymous;
  const { width } = useWindowDimensions();
  const utBreakpoint = width <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop';

  const utWinnerDiv = (
    <div className="area-flex-col look-div-backlight mod-padding-l">
      <p className="look-text-x5 look-text-hero mod-left">Scores to leverage.</p>
      <p className="look-text-subtle mod-left">See last week's best performers</p>
      <a href={utLink} className="look-button-primary mod-left" style={{ flexGrow: 0 }}>
        {prLoggedIn ? 'Search Tickers' : 'Sign Up'}
      </a>
      <div className="mod-left">
        <PRV_WinnerStore args={[]}>
          <COM_Winners prBreakpoint={utBreakpoint} />
        </PRV_WinnerStore>
      </div>
    </div>
  );
  const utSecondaryDiv = (
    <>
      <div className="area-flex-col look-div-backlight mod-padding-l">
        <p className="look-text-x5 look-text-hero mod-left">Data to browse.</p>
        <p className="look-text-subtle mod-left">
          stockz.ai covers 20k+ companies and scores all their key financial & valuation ratios
          against their peers.
        </p>
        <img
          className="mod-margin-negative-l"
          style={{ marginTop: 'auto' }}
          src={IMG_TableRatios}
          alt="Scores"
        />
      </div>
      <div className="area-flex-col look-div-backlight mod-padding-l">
        <p className="look-text-x5 look-text-hero mod-left">100% Free.</p>
        <p className="look-text-subtle mod-left">
          100% free during Beta. No ads, no ‘get-rich-quick’ promises. Just clean data and clarity.
        </p>
      </div>
    </>
  );

  return (
    <div className={SECTION_CLASS_LOOKUP[utBreakpoint]}>
      {utWinnerDiv}
      <div className={SECONDARY_CLASS_LOOKUP[utBreakpoint]}>{utSecondaryDiv}</div>
    </div>
  );
}
