import { LANDINGPAGE_BUTTON_LINKS } from '../../constants';
import COM_Hero from '../COM_Hero';
import IMG_HeroScores from '../../assets/media/IMG_HeroScores.png';

export default function COM_SectionHero(prLoggedIn: { prLoggedIn: boolean }) {
  const utLink = prLoggedIn ? LANDINGPAGE_BUTTON_LINKS.login : LANDINGPAGE_BUTTON_LINKS.anonymous;
  return (
    <COM_Hero prFlex={true}>
      <div className="area-flex-col mod-gap-l mod-padding-xl look-div-backlight mod-flex-grow">
        <div className="area-flex-col mod-gap-l">
          <div className="area-flex-col mod-padding-none">
            <h1 className="look-text-x8 look-text-hero" style={{ maxWidth: '50rem' }}>
              Fundamental analysis in seconds.
            </h1>
            <p className="mod-align-center">
              20k+ companies. Scored & Compared. Instant clarity, no spreadsheets
            </p>
          </div>
          <a href={utLink} className="look-button-primary">
            {prLoggedIn ? 'Search Tickers' : 'Join Free Beta'}
          </a>
          <img className="img-hero" src={IMG_HeroScores} alt="Scores" />
        </div>
      </div>
      <div className="area-flex-wrap mod-center">
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
