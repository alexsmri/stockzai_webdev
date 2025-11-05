import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ICON_ArrowLeft from '@/assets/media/ICON_ArrowLeft.svg?react';
import ICON_Checkmark from '@/assets/media/ICON_Checkmark.svg?react';
import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_Hero from '../components/COM_Hero';
import { scale } from '../utils/functions';

const PRO_FEATURES = [
  'Full coverage of 20,000+ companies with daily updates.',
  'Complete financial statements, ratio breakdowns, and valuation metrics.',
  'Interactive KPI deep dives with sector percentile benchmarks.',
  'Sector leaderboards and Top Stocks rankings designed for quick discovery.',
];

export default function PAG_SubscribeConfirmation() {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate('/companies/search');
  }, [navigate]);

  return (
    <>
      <COM_Hero prFlex={true}>
        <div className="area-flex-col mod-gap-m mod-align-stretch">
          <div className="area-flex-col mod-gap-l mod-align-left">
            <div className="area-flex-col mod-gap-s">
              <ICON_Checkmark
                style={{
                  width: scale(5),
                  height: 'auto',
                  flexShrink: 0,
                  color: 'var(--color-tertiary)',
                }}
                aria-hidden="true"
              />
              <h1 className="look-text-x3 mod-text-align-center look-priority-high mod-padding-none">
                Thanks for purchasing stockz.ai Pro
              </h1>
              <p className="look-text-x1 look-priority-medium mod-text-align-center mod-padding-none">
                Your upgrade is active - here is everything you can dive into right away.
              </p>
            </div>
            <ul className="mod-padding-s">
              {PRO_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="look-text-x1 mod-padding-s look-priority-medium"
                  role="listitem"
                >
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="look-text-clickable area-flex-row mod-gap-s mod-center"
              style={{
                justifyContent: 'center',
              }}
              onClick={handleBack}
              aria-label="Back to search"
            >
              <span>Start Exploring</span>
              <ICON_ArrowLeft
                style={{
                  width: scale(1.3),
                  height: 'auto',
                  flexShrink: 0,
                  transform: 'rotateZ(180deg)',
                }}
              />
            </button>
          </div>
        </div>
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
