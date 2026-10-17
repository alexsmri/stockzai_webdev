import { Link } from 'react-router-dom';
import ICON_Stocks from '@/assets/media/ICON_Stocks.svg?react';
import ICON_Star from '@/assets/media/ICON_Star.svg?react';
import ICON_FirstPlace from '@/assets/media/ICON_FirstPlace.svg?react';
import { LANDING_IMAGES } from '../../assets/landing';
import { LANDING_ROUTES } from './landingContent';

function COM_LandFundamentals() {
  return (
    <section id="scores" className="lp-section lp-fundamentals">
      <h2 className="lp-title lp-title-l lp-reveal">
        <span className="lp-dim">Fundamentals</span> <span className="lp-bright">made simple.</span>
      </h2>
      <div className="lp-bento">
        <article className="lp-card lp-reveal lp-reveal-d1">
          <p className="lp-card-tag">
            <ICON_Stocks /> Fundamental Scores
          </p>
          <p className="lp-title lp-title-s">
            <span className="lp-bright">Instant Clarity</span>{' '}
            <span className="lp-dim">with scores distilling hour-long fundamental analysis.</span>
          </p>
          <img
            className="lp-card-image lp-card-image-inset lp-tilt-scores lp-shadow"
            src={LANDING_IMAGES.cardScores}
            alt="Fundamental scores"
          />
          <Link className="lp-card-link" to={LANDING_ROUTES.register}>
            Discover more
          </Link>
        </article>

        <article className="lp-card lp-reveal lp-reveal-d2">
          <p className="lp-card-tag">
            <ICON_Star /> KPI Details
          </p>
          <p className="lp-title lp-title-s">
            <span className="lp-bright">Million-dollar insights</span>{' '}
            <span className="lp-dim">that would take thousands of Excel cells.</span>
          </p>
          <img
            className="lp-card-image lp-card-image-inset lp-tilt-kpi lp-shadow"
            src={LANDING_IMAGES.cardKpi}
            alt="KPI details"
          />
          <Link className="lp-card-link" to={LANDING_ROUTES.register}>
            Discover more
          </Link>
        </article>

        <article className="lp-card lp-card-wide lp-reveal lp-reveal-d1">
          <p className="lp-card-tag">
            <ICON_FirstPlace /> Sector Leaderboards
          </p>
          <p className="lp-title lp-title-s">
            <span className="lp-dim">Reveal</span> <span className="lp-bright">hidden champions</span>{' '}
            <span className="lp-dim">- with 0 research.</span>
          </p>
          <img
            className="lp-card-image lp-card-image-bleed lp-tilt-leaderboard lp-shadow"
            src={LANDING_IMAGES.cardLeaderboard}
            alt="Sector leaderboard"
          />
        </article>
      </div>
    </section>
  );
}

export default COM_LandFundamentals;
