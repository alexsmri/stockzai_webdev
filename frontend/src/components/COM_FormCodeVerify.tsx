import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DCOM_FormCode from './dumb/DCOM_FormCode';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import { REGISTRATION_PASSWORD_STORAGE_KEY } from '../constants';
import type { ValidKeys } from '../stores/STO_Users';
import { censorEmail } from '../utils/formats';

interface ITF_FormCodeVerifyProps {
  prUid: string;
  prEmail: string;
  prUsername?: string;
  prRedirect?: string;
  prSubmitKey: ValidKeys;
  prResendKey?: ValidKeys;
  prExtraPayload?: Record<string, any>;
  prOnSuccess?: (result: any, codeValue: string) => Promise<void> | void;
  prHeadingOverride?: string;
  prInstructionsOverride?: string;
}

const DEFAULT_REDIRECT = '/users/plans/select';

const clearTemporaryPassword = () => {
  try {
    window.sessionStorage.removeItem(REGISTRATION_PASSWORD_STORAGE_KEY);
  } catch (error) {
    console.error('Unable to clear temporary password from sessionStorage', error);
  }
};

export default function COM_FormCodeVerify({
  prUid,
  prEmail,
  prUsername,
  prRedirect = DEFAULT_REDIRECT,
  prSubmitKey,
  prResendKey = 'TokenVerificationRequest',
  prExtraPayload,
  prOnSuccess,
  prHeadingOverride,
  prInstructionsOverride,
}: ITF_FormCodeVerifyProps) {
  const utStore = useUserStore();
  const navigate = useNavigate();
  const { handleAlertOpen } = useAlert();
  const [stBusy, setStBusy] = useState(false);

  const utCensoredEmail = useMemo(() => (prEmail ? censorEmail(prEmail) : 'your email'), [prEmail]);

  const handleSubmit = async (codeValue: string) => {
    setStBusy(true);
    try {
      const payload = { token: codeValue, uid: prUid, ...(prExtraPayload || {}) };
      const utRes = await utStore.post(prSubmitKey, payload, true);
      if (!utRes) {
        const utError = utStore.getError(prSubmitKey) as string | undefined;
        handleAlertOpen('An error occurred', utError || 'Wrong code. Try again.', 'f');
        return;
      }

      if (prOnSuccess) {
        await prOnSuccess(utRes, codeValue);
        return;
      }

      let storedPassword: string | null = null;
      try {
        storedPassword = window.sessionStorage.getItem(REGISTRATION_PASSWORD_STORAGE_KEY);
      } catch (error) {
        console.error('Unable to read temporary password from sessionStorage', error);
      }

      if (!storedPassword) {
        handleAlertOpen(
          'Verification complete',
          'Account verified! Please log in to continue.',
          'i'
        );
        navigate('/users/login');
        return;
      }

      const loginRes = await utStore.post('ActionLogin', {
        email: prEmail,
        password: storedPassword,
      });
      if (!loginRes) {
        clearTemporaryPassword();
        handleAlertOpen('Manual login required', 'Account verified. Please log in manually.', 'w', {
          timeout: 5000,
        });
        navigate('/users/login');
        return;
      }

      clearTemporaryPassword();
      await utStore.get('PropertyCredentials');
      handleAlertOpen('Welcome', `Welcome to stockz.ai, ${prUsername || 'there'}!`, 's');
      navigate(prRedirect);
    } finally {
      setStBusy(false);
    }
  };

  const handleResend = async () => {
    if (!prResendKey) return false;
    if (prResendKey === 'TokenVerificationRequest') {
      const utTokenRes = (await utStore.post(prResendKey, { email: prEmail }, true)) as Record<
        string,
        any
      > | null;
      if (utTokenRes?.uid) {
        handleAlertOpen('Code sent', 'A new verification code has been sent.', 's');
        return true;
      }
      handleAlertOpen(
        'An error occurred',
        'Could not resend the code. Please try again shortly.',
        'f'
      );
      return false;
    }

    const utTokenRes = (await utStore.post(prResendKey, prExtraPayload || {}, true)) as Record<
      string,
      any
    > | null;
    if (utTokenRes?.uid) {
      handleAlertOpen('Code sent', 'A new verification code has been sent.', 's');
      return true;
    }
    const utError = utStore.getError(prResendKey) as string | undefined;
    handleAlertOpen('An error occurred', utError || 'Could not resend the code.', 'f');
    return false;
  };

  const heading = prHeadingOverride || 'Verify Email';
  const instructions =
    prInstructionsOverride ||
    `An email with a six-digit code has just been sent to ${utCensoredEmail}. Enter the code below.`;

  return (
    <DCOM_FormCode
      prHeading={heading}
      prInstructions={instructions}
      prOnSubmit={handleSubmit}
      prOnResend={handleResend}
      prBusy={stBusy}
      prSubmitLabel="Verify"
    />
  );
}
