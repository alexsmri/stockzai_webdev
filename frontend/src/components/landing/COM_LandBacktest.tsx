import { Link } from 'react-router-dom';
import COM_LandBacktestChart from './COM_LandBacktestChart';
import { LANDING_ROUTES } from './landingContent';

function COM_LandBacktest() {
  return (
    <>
      <section className="lp-section lp-quote">
        <p className="lp-title lp-title-m lp-reveal">
          <span className="lp-dim">It's not about watching the market.</span>
          <br />
          <span className="lp-dim">It's about not</span> <span className="lp-bright">having to.</span>
        </p>
        <p className="lp-eyebrow lp-reveal lp-reveal-d1">Alex, Founder</p>
      </section>

      <section id="backtest" className="lp-section lp-backtest">
        <h2 className="lp-title lp-title-l lp-reveal">
          <span className="lp-dim">Scores that</span> <span className="lp-bright">work.</span>
        </h2>
        <article className="lp-card lp-card-wide lp-reveal lp-reveal-d1">
          <p className="lp-title lp-title-s">
            <span className="lp-bright">Verified</span>{' '}
            <span className="lp-dim">in a 22-month backtest, a 5-year one is planned.</span>
          </p>
          <Link className="lp-card-link lp-card-link-inline" to={LANDING_ROUTES.backtest}>
            Discover more
          </Link>
          <COM_LandBacktestChart />
        </article>
      </section>
    </>
  );
}

export default COM_LandBacktest;
