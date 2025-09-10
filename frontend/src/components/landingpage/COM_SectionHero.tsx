import { LANDINGPAGE_BUTTON_LINKS } from '../../constants';
import COM_Hero from '../COM_Hero';
import IMG_ScoresBox from '../../assets/media/IMG_ScoresPlain.png';
import IMG_FinancialGraph from '../../assets/media/IMG_FinancialGraph.png';
import IMG_ValuationGraph from '../../assets/media/IMG_ValuationGraph.png';

export default function COM_SectionHero(prLoggedIn: { prLoggedIn: boolean }) {
  const utLink = prLoggedIn ? LANDINGPAGE_BUTTON_LINKS.login : LANDINGPAGE_BUTTON_LINKS.anonymous;
  return (
    <COM_Hero prFlex={true}>
      <div className="area-flex-col mod-gap-l look-div-backlight mod-flex-grow">
        <div className="area-flex-col mod-gap-l">
          <h1 className="look-text-x8 look-text-hero">Fundamental analysis</h1>
          <h1 className="look-text-x8 look-text-hero">in seconds.</h1>
          <h3 className="look-text-x2">
            20k+ companies. Scored & Compared. Instant clarity, no spreadsheets
          </h3>
          <a href={utLink} className="look-button-primary">
            {prLoggedIn ? 'Search Tickers' : 'Join Free Beta'}
          </a>
          <div className="area-flex-row">
            <img
              src={IMG_FinancialGraph}
              style={{ maxWidth: '16rem', aspectRatio: 'auto', alignSelf: 'end' }}
            />
            <img
              src={IMG_ScoresBox}
              style={{ maxWidth: '20rem', aspectRatio: 'auto', alignSelf: 'center' }}
            />
            <img
              src={IMG_ValuationGraph}
              style={{ maxWidth: '16rem', aspectRatio: 'auto', alignSelf: 'end' }}
            />
          </div>
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
