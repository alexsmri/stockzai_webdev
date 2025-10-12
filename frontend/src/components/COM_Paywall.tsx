import { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import ICON_ArrowLeft from '@/assets/media/ICON_ArrowLeft.svg?react';
import COM_Plans from './COM_Plans';

interface PI_Paywall {
  prIsOpen: boolean;
  prChildren?: JSX.Element;
}

export default function COM_Paywall({ prIsOpen, prChildren }: PI_Paywall) {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/companies/search');
  };

  if (!prIsOpen) {
    return null;
  }

  return (
    <div className="area-paywall">
      <div
        className="area-flex-col mod-center mod-padding-none"
        style={{ width: 'min(640px, 100%)' }}
      >
        <button
          type="button"
          className="look-text-clickable area-flex-row mod-gap-s mod-align-left"
          style={{
            display: 'inline-flex',
            width: '100%',
            justifyContent: 'start',
            alignItems: 'center',
            margin: 0,
            padding: '0.4rem 0.8rem',
          }}
          onClick={handleBack}
          aria-label="Go back to search"
        >
          <ICON_ArrowLeft
            style={{ width: 'calc(var(--default-font-size) * 1.3)', height: 'auto', flexShrink: 0 }}
            fill="currentColor"
          />
          <span>Back</span>
        </button>
        <div
          className="look-div-solid area-flex-col mod-align-center"
          style={{
            width: 'min(640px, 100%)',
            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.45)',
            borderRadius: '1rem',
            overflow: 'hidden',
          }}
        >
          {prChildren ?? <COM_Plans />}
        </div>
      </div>
    </div>
  );
}
