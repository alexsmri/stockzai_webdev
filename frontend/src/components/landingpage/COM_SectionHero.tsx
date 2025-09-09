import { LANDINGPAGE_BUTTON_LINKS } from '../../constants';
import COM_Hero from '../COM_Hero';

export default function COM_SectionHero(prLoggedIn: { prLoggedIn: boolean }) {
  const utLink = prLoggedIn ? LANDINGPAGE_BUTTON_LINKS.login : LANDINGPAGE_BUTTON_LINKS.anonymous;
  return (
    <COM_Hero>
      <div className="area-flex-col mod-gap-l look-div-backlight">
        <div className="area-flex-col mod-gap-l">
          <h1 className="look-text-x8 look-text-hero">Master the Market. Effortlessly.</h1>
          <h3 className="look-text-x2">All the info you need, none of the noise. 100% Free.</h3>
          <a href={utLink} className="look-button-primary">
            {prLoggedIn ? 'Search Tickers' : 'Join Free Beta'}
          </a>
        </div>
      </div>
      <div className="area-flex-row">
        <div className="area-flex-row look-div-container mod-gap-l">
          <p className="look-text-x4 look-text-hero">20.000+</p>
          <p className="look-text-subtle look-text-x1">companies</p>
        </div>
        <div className="area-flex-row look-div-container mod-gap-l">
          <p className="look-text-x4 look-text-hero">100+</p>
          <p className="look-text-subtle look-text-x1">KPIs / company</p>
        </div>
      </div>
    </COM_Hero>
  );
}
