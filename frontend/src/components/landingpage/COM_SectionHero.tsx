import { LANDINGPAGE_BUTTON_LINKS } from '../../constants';
import IMG_HeroScores from '../../assets/media/IMG_HeroScores.webp';

export default function COM_SectionHero({ prLoggedIn }: { prLoggedIn: boolean | null }) {
  const utLink = prLoggedIn ? LANDINGPAGE_BUTTON_LINKS.login : LANDINGPAGE_BUTTON_LINKS.anonymous;
  const utText = prLoggedIn ? 'Search Tickers' : 'Join Free Beta';
  console.log(prLoggedIn);
  console.log(utLink, utText);
  return (
    <div className="area-flex-col mod-padding-hero mod-align-stretch">
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
            {utText}
          </a>
          <img
            className="img-hero"
            src={IMG_HeroScores}
            alt="Scores"
            loading="lazy"
            fetchPriority="high"
          />
        </div>
      </div>
      <div className="area-flex-wrap mod-center">
        <div className="area-flex-row mod-gap-l mod-center">
          <p className="look-text-x4 look-text-hero">20.000+</p>
          <p className="look-text-subtle look-text-x1 mod-center">companies</p>
        </div>
        <div className="area-flex-row mod-gap-l mod-center">
          <p className="look-text-x4 look-text-hero">100+</p>
          <p className="look-text-subtle look-text-x1 mod-center">KPIs / company</p>
        </div>
      </div>
    </div>
  );
}
