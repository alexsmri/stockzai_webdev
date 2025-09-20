import { createContext, useContext, useState } from 'react';
import COM_Alert from '../components/COM_Alert';
import { sleep } from '../utils/functions';

const DEFAULT_ALERT_TYPE = 'i';
const DEFAULT_ALERT_TIMEOUT = 3000;

interface ITF_AlertContext {
  handleAlertOpen: (
    prTitle: string,
    prMessage: string,
    prType: 's' | 'i' | 'w' | 'f',
    prTimeout?: number
  ) => void;
  handleAlertClose: () => void;
}

const CTX_Alert = createContext<ITF_AlertContext | undefined>(undefined);

export const PRV_Alert = ({ children }: { children: React.ReactNode }) => {
  const [stIsOpen, setStIsOpen] = useState(false);
  const [stMessage, setStMessage] = useState<string>('');
  const [stTitle, setStTitle] = useState<string>('');
  const [stType, setStType] = useState<'s' | 'i' | 'w' | 'f'>(DEFAULT_ALERT_TYPE);
  const [stTimeout, setStTimeout] = useState<number>(DEFAULT_ALERT_TIMEOUT);
  const [stCurrentAlertId, setStCurrentAlertId] = useState(0);

  const handleAlertOpen = (
    prTitle: string,
    prMessage: string,
    prType: 's' | 'i' | 'w' | 'f' = 'i',
    prTimeout: number = DEFAULT_ALERT_TIMEOUT
  ) => {
    setStTitle(prTitle);
    setStMessage(prMessage);
    setStType(prType);
    setStTimeout(prTimeout);

    const alertId = Date.now();
    setStCurrentAlertId(alertId);
    setStIsOpen(true);

    (async () => {
      await sleep(prTimeout);
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
