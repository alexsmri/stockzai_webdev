import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import IconCheckmark from '@/assets/media/ICON_Checkmark.svg?react';
import IconInfo from '@/assets/media/ICON_Info.svg?react';
import IconWarning from '@/assets/media/ICON_Warning.svg?react';
import IconClose from '@/assets/media/ICON_Close.svg?react';
import { sleep } from '../utils/functions';

type TTAlertType = 's' | 'i' | 'w' | 'f';

type TAlertIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ALERT_COLOR_LOOKUP: Record<TTAlertType, string> = {
  s: 'var(--color-success)',
  i: 'var(--color-info)',
  w: 'var(--color-warning)',
  f: 'var(--color-failure)',
};

const ALERT_BACKGROUND_COLOR_LOOKUP: Record<TTAlertType, string> = {
  s: 'rgba(0, 81, 49, 0.4)',
  i: 'rgba(30, 22, 97, 0.4)',
  w: 'rgba(126, 64, 19, 0.4)',
  f: 'rgba(81, 0, 1, 0.4)',
};

const ALERT_FADEOUT_DURATION = 300;

const ALERT_ICON_LOOKUP: Record<TTAlertType, TAlertIconComponent> = {
  s: IconCheckmark,
  i: IconInfo,
  w: IconWarning,
  f: IconWarning,
};

export interface ITF_AlertButton {
  label: string;
  onClick: () => void;
}

interface ITF_AlertProps {
  prId: number;
  prSignal: boolean;
  prTitle: string;
  prMessage: string;
  prType: TTAlertType;
  prTimeout: number;
  prButton?: ITF_AlertButton;
  prOnClose: () => void;
}

export default function COM_Alert({
  prId,
  prSignal,
  prTitle,
  prMessage,
  prType,
  prButton,
  prOnClose,
}: ITF_AlertProps) {
  const [stIsOpen, setStIsOpen] = useState(prSignal);
  const [stAnimating, setStAnimating] = useState(prSignal);

  useEffect(() => {
    let cancelled = false;

    if (prSignal) {
      setStAnimating(true);
      setStIsOpen(true);
    } else {
      (async () => {
        setStAnimating(false);
        await sleep(ALERT_FADEOUT_DURATION);
        if (!cancelled) {
          setStIsOpen(false);
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [prId, prSignal]);

  const handleClose = () => {
    prOnClose();
  };

  if (!stIsOpen) {
    return null;
  }

  const AlertIcon = ALERT_ICON_LOOKUP[prType];

  return (
    <div className="mod-z-5" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}>
      <div
        className={`look-div-subtle ${stAnimating ? 'fade-in-alert' : 'fade-out-alert'}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '28rem',
          padding: '1rem 1.25rem',
          boxShadow: '0 1.2rem 2.4rem rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '0.75rem',
              backgroundColor: ALERT_BACKGROUND_COLOR_LOOKUP[prType],
            }}
          />
          <AlertIcon
            aria-hidden="true"
            style={{
              position: 'relative',
              width: '1.25rem',
              height: '1.25rem',
              color: ALERT_COLOR_LOOKUP[prType],
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <p className="look-text-x0 look-priority-high" style={{ margin: 0 }}>
            {prTitle}
          </p>
          <p className="look-text-x0 look-priority-low" style={{ margin: 0 }}>
            {prMessage}
          </p>
          {prButton ? (
            <button type="button" className="look-button-ghost" onClick={prButton.onClick}>
              {prButton.label}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="look-button-ghost"
          style={{ padding: '0.25rem', minWidth: 'auto' }}
          aria-label="Dismiss alert"
        >
          <IconClose aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
        </button>
      </div>
    </div>
  );
}
