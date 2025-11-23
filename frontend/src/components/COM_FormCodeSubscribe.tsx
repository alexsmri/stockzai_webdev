import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DCOM_FormCode from './DCOM_FormCode';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import { censorEmail } from '../utils/formats';

interface ITF_FormCodeSubscribeProps {
  prUid: string;
  prEmail: string;
  prUsername?: string;
  prRedirect?: string;
}

const DEFAULT_REDIRECT = '/';

export default function COM_FormCodeSubscribe({
  prUid,
  prEmail,
  prUsername,
  prRedirect = DEFAULT_REDIRECT,
}: ITF_FormCodeSubscribeProps) {
  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();
  const [stBusy, setStBusy] = useState(false);

  const utCensoredEmail = useMemo(() => (prEmail ? censorEmail(prEmail) : 'your email'), [prEmail]);

  const handleSubmit = async (codeValue: string) => {
    setStBusy(true);
    try {
      const utValid = await utStore.post('ActionSubscribeNewsletterVerify', {
        token: codeValue,
        uid: prUid,
      });

      if (!utValid) {
        const utError = utStore.getError('ActionSubscribeNewsletterVerify') as string | undefined;
        handleAlertOpen('An error occurred', utError || 'Wrong code. Try again.', 'f');
        return;
      }

      await utStore.get('PropertyConsents');
      handleAlertOpen(
        'Success',
        prUsername
          ? `Newsletter subscription confirmed. Thank you, ${prUsername}!`
          : 'Newsletter subscription confirmed.',
        's'
      );
      navigate(prRedirect);
    } finally {
      setStBusy(false);
    }
  };

  const handleResend = async () => {
    const utTokenRes = (await utStore.post('ActionSubscribeNewsletterRequest', {}, true)) as
      | Record<string, any>
      | null;
    if (utTokenRes?.uid) {
      handleAlertOpen('Code sent', 'A new confirmation code has been sent.', 's');
      return true;
    }
    handleAlertOpen(
      'An error occurred',
      'Could not resend the code. Please try again shortly.',
      'f'
    );
    return false;
  };

  const heading = 'Confirm Subscription';
  const instructions = `We sent a six-digit code to ${utCensoredEmail}. Enter it below to confirm your subscription.`;

  return (
    <DCOM_FormCode
      prHeading={heading}
      prInstructions={instructions}
      prOnSubmit={handleSubmit}
      prOnResend={handleResend}
      prBusy={stBusy}
      prSubmitLabel="Confirm"
    />
  );
}
