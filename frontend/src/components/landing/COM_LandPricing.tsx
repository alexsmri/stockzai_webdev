import { Link } from 'react-router-dom';
import ICON_Check from '@/assets/media/ICON_Check.svg?react';
import { LANDING_PRICING, LANDING_ROUTES } from './landingContent';

function COM_LandPricing() {
  const { free, pro } = LANDING_PRICING;
  return (
    <section id="pricing" className="lp-section lp-pricing">
      <h2 className="lp-title lp-title-l lp-reveal">
        <span className="lp-dim">For less than</span> <span className="lp-bright">a monthly burger.</span>
      </h2>
      <div className="lp-plans">
        <article className="lp-card lp-plan lp-reveal lp-reveal-d1">
          <h3 className="lp-plan-title">{free.title}</h3>
          <p className="lp-title lp-title-s">
            <span className="lp-dim">{free.intro}</span> <br />
            <span className="lp-bright">{free.price}</span>
          </p>
          <ul className="lp-plan-features">
            {free.features.map((feature) => (
              <li key={feature}>
                <ICON_Check /> {feature}
              </li>
            ))}
          </ul>
          <Link className="lp-button lp-button-ghost lp-button-block" to={LANDING_ROUTES.register}>
            {free.cta}
          </Link>
        </article>

        <article className="lp-card lp-plan lp-plan-pro lp-reveal lp-reveal-d2">
          <h3 className="lp-plan-title">
            {pro.title} <span className="lp-badge">{pro.badge}</span>
          </h3>
          <p className="lp-title lp-title-s">
            <span className="lp-dim">{pro.intro}</span> <br />
            <span className="lp-bright">{pro.price}</span>
            <span className="lp-dim">{pro.priceSuffix}</span>
          </p>
          <ul className="lp-plan-features">
            {pro.features.map((feature) => (
              <li key={feature}>
                <ICON_Check /> {feature}
              </li>
            ))}
          </ul>
          <Link className="lp-button lp-button-accent lp-button-block" to={LANDING_ROUTES.pro}>
            {pro.cta}
          </Link>
        </article>
      </div>
    </section>
  );
}

export default COM_LandPricing;
