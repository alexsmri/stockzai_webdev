import { Link } from 'react-router-dom';
import { LANDING_IMAGES } from '../../assets/landing';
import { LANDING_ROUTES, LANDING_STATS } from './landingContent';

function COM_LandHero() {
  return (
    <section className="lp-section lp-hero">
      <p className="lp-eyebrow lp-reveal">Trusted by 400+ investors</p>
      <h1 className="lp-title lp-title-xl lp-reveal lp-reveal-d1">
        <span className="lp-bright">Stop drowning</span> <span className="lp-dim">in financial data.</span>
        <br />
        <span className="lp-bright">Save hours.</span> <span className="lp-dim">Make</span>{' '}
        <span className="lp-bright">better decisions.</span>
      </h1>
      <p className="lp-lead lp-reveal lp-reveal-d2">
        stockz.ai turns millions of fundamental data points into three simple scores—
        <br />
        so you can instantly understand any company. Without spreadsheets, guesswork or overload.
      </p>
      <div className="lp-reveal lp-reveal-d3">
        <Link className="lp-button lp-button-light lp-button-lg" to={LANDING_ROUTES.register}>
          Get stockz.ai for free <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="lp-hero-visual lp-reveal lp-reveal-d4">
        <img className="lp-hero-card lp-hero-card-left lp-shadow" src={LANDING_IMAGES.heroScores} alt="Fundamental scores" />
        <img className="lp-hero-card lp-hero-card-center lp-shadow" src={LANDING_IMAGES.heroRisk} alt="Risk analysis" />
        <img className="lp-hero-card lp-hero-card-right lp-shadow" src={LANDING_IMAGES.heroKpi} alt="P/E ratio KPI" />
      </div>

      <ul className="lp-stats lp-reveal lp-reveal-d5">
        {LANDING_STATS.map(({ value, label }) => (
          <li key={label}>
            <span className="lp-bright">{value}</span> <span className="lp-dim">{label}</span>
          </li>
        ))}
      </ul>
      <p className="lp-eyebrow lp-reveal lp-reveal-d6">Data refreshed every ~7 days</p>
    </section>
  );
}

export default COM_LandHero;
