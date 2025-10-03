import { useEffect, useState } from 'react';
import { sleep } from '../utils/functions';

const ALERT_DIV_LOOKUP = {
  s: 'area-alert-success',
  i: 'area-alert-info',
  w: 'area-alert-warning',
  f: 'area-alert-failure',
};
const ALERT_FADEOUT_DURATION = 300;

interface ITF_AlertProps {
  prId: number;
  prSignal: boolean;
  prMessage: string;
  prType: 's' | 'i' | 'w' | 'f';
  prTimeout: number;
}

function COM_Alert({ prId, prSignal, prMessage, prType }: ITF_AlertProps) {
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

  return (
    <>
      {stIsOpen && (
        <div
          className={`${ALERT_DIV_LOOKUP[prType]} mod-z-2 ${
            stAnimating ? 'fade-in-alert' : 'fade-out-alert'
          }`}
        >
          <p>{prMessage}</p>
          <p className="mod-cursor-pointer" onClick={() => setStIsOpen(false)}>
            <strong>x</strong>
          </p>
        </div>
      )}
    </>
  );
}

export default COM_Alert;

