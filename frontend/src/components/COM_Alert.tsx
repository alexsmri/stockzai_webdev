import { useEffect, useState } from 'react';
import { sleep } from '../utils/functions';
import ICON_Failure from '../assets/media/ICON_Error.svg';
import ICON_Info from '../assets/media/ICON_Info.svg';
import ICON_Warning from '../assets/media/ICON_Warning.svg';
import ICON_Success from '../assets/media/ICON_Success.svg';
import ICON_Close from '../assets/media/ICON_Close.svg';

const ICON_LOOKUP = {
  s: ICON_Success,
  i: ICON_Info,
  w: ICON_Warning,
  f: ICON_Failure,
};

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
  prTitle: string;
  prMessage: string;
  prType: 's' | 'i' | 'w' | 'f';
  prTimeout: number;
}

function COM_Alert({ prId, prSignal, prTitle, prMessage, prType }: ITF_AlertProps) {
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
          className={`${ALERT_DIV_LOOKUP[prType]} mod-z-top ${
            stAnimating ? 'fade-in-alert' : 'fade-out-alert'
          }`}
        >
          <div>{ICON_LOOKUP[prType]}</div>
          <div>
            <p>{prTitle}</p>
            <p>{prMessage}</p>
          </div>
          <div className="mod-cursor-pointer" onClick={() => setStIsOpen(false)}>
            <ICON_Close />
          </div>
        </div>
      )}
    </>
  );
}

export default COM_Alert;
