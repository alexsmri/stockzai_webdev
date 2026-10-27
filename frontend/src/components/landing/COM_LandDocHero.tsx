import { Link } from 'react-router-dom';
import ICON_ArrowUpRight from '@/assets/media/ICON_ArrowUpRight.svg?react';
import { LANDING_ROUTES } from './landingContent';

interface LandDocHeroProps {
  prDimTitle: string;
  prBrightTitle: string;
  prSubtitle: string;
}

// Hero for the doc pages (backtest, scores). Carries the page's h1.
function COM_LandDocHero({ prDimTitle, prBrightTitle, prSubtitle }: LandDocHeroProps) {
  return (
    <header className="lp-doc-hero">
      <h1 className="lp-title lp-title-xl">
        <span className="lp-dim">{prDimTitle}</span> <span className="lp-bright">{prBrightTitle}</span>
      </h1>
      <p className="lp-lead">{prSubtitle}</p>
      <Link className="lp-button lp-button-light lp-button-lg" to={LANDING_ROUTES.register}>
        Get stockz.ai for free <ICON_ArrowUpRight aria-hidden="true" />
      </Link>
    </header>
  );
}

export default COM_LandDocHero;
