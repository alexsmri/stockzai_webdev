import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ICON_Checkmark from '@/assets/media/ICON_Checkmark.svg?react';
import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_Hero from '../components/COM_Hero';
import { scale } from '../utils/functions';

export default function PAG_SocialLinkConfirmation() {
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    navigate('/companies/search');
  }, [navigate]);

  return (
    <>
      <COM_Hero prFlex={true}>
        <div className="area-flex-col mod-gap-m mod-align-stretch">
          <div className="area-flex-col mod-gap-l mod-align-left">
            <div className="area-flex-col mod-gap-s mod-align-center">
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
                Success!
              </h1>
              <p className="look-text-x1 look-priority-medium mod-text-align-center mod-padding-none">
                Your Google Sign In has been linked to your stockz.ai account.
              </p>
            </div>
            <button
              type="button"
              className="look-text-clickable area-flex-row mod-gap-s mod-center"
              style={{ justifyContent: 'center' }}
              onClick={handleNext}
              aria-label="Go to company search"
            >
              <span>Start exploring companies</span>
            </button>
          </div>
        </div>
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
