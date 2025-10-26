import { createContext, useContext, useState } from 'react';
import COM_Alert, { type ITF_AlertButton } from '../components/COM_Alert';
import { sleep } from '../utils/functions';

type TTAlertType = 's' | 'i' | 'w' | 'f';

const DEFAULT_ALERT_TYPE: TTAlertType = 'i';
const DEFAULT_ALERT_TIMEOUT = 3000;

interface ITF_AlertOptions {
  timeout?: number;
  button?: ITF_AlertButton;
}

interface ITF_AlertContext {
  handleAlertOpen: (
    prTitle: string,
    prMessage: string,
    prType?: TTAlertType,
    prOptions?: ITF_AlertOptions
  ) => void;
  handleAlertClose: () => void;
}

const CTX_Alert = createContext<ITF_AlertContext | undefined>(undefined);

export const PRV_Alert = ({ children }: { children: React.ReactNode }) => {
  const [stIsOpen, setStIsOpen] = useState(false);
  const [stTitle, setStTitle] = useState<string>('');
  const [stMessage, setStMessage] = useState<string>('');
  const [stType, setStType] = useState<TTAlertType>(DEFAULT_ALERT_TYPE);
  const [stTimeout, setStTimeout] = useState<number>(DEFAULT_ALERT_TIMEOUT);
  const [stButton, setStButton] = useState<ITF_AlertButton | undefined>(undefined);
  const [stCurrentAlertId, setStCurrentAlertId] = useState(0);

  const handleAlertOpen = (
    prTitle: string,
    prMessage: string,
    prType: TTAlertType = DEFAULT_ALERT_TYPE,
    prOptions: ITF_AlertOptions = {}
  ) => {
    const nextTimeout = prOptions.timeout ?? DEFAULT_ALERT_TIMEOUT;

    setStTitle(prTitle);
    setStMessage(prMessage);
    setStType(prType);
    setStTimeout(nextTimeout);
    setStButton(prOptions.button);

    const alertId = Date.now();
    setStCurrentAlertId(alertId);
    setStIsOpen(true);

    (async () => {
      await sleep(nextTimeout);
      setStCurrentAlertId((latestId) => {
        if (latestId !== alertId) return latestId;
        setStIsOpen(false);
        return latestId;
      });
    })();
  };
  const handleAlertClose = () => {
    (async () => {
      setStIsOpen(false);
    })();
  };

  return (
    <CTX_Alert.Provider
      value={{
        handleAlertOpen,
        handleAlertClose,
      }}
    >
      <COM_Alert
        prId={stCurrentAlertId}
        prSignal={stIsOpen}
        prTitle={stTitle}
        prMessage={stMessage}
        prType={stType}
        prTimeout={stTimeout}
        prButton={stButton}
        prOnClose={handleAlertClose}
      />
      {children}
    </CTX_Alert.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(CTX_Alert);
  if (!ctx) throw new Error('useAlert must be used inside PRV_Alert');
  return ctx;
};
