import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/CTX_Alert';
import {
  REGISTRATION_PASSWORD_STORAGE_KEY,
  REGISTRATION_RESEND_COOLDOWN_SECONDS,
} from '../constants';
import { censorEmail } from '../utils/formats';
import { scale } from '../utils/functions';

const CODE_LENGTH = 6;

type FormCodeMode = 'registration' | 'newsletter';

interface ITF_FormCodeProps {
  prUid: string;
  prEmail: string;
  prUsername?: string;
  prMode?: FormCodeMode;
  prRedirect?: string;
}

const clearTemporaryPassword = () => {
  try {
    window.sessionStorage.removeItem(REGISTRATION_PASSWORD_STORAGE_KEY);
  } catch (error) {
    console.error('Unable to clear temporary password from sessionStorage', error);
  }
};

export default function COM_FormCode({
  prUid,
  prEmail,
  prUsername,
  prMode = 'registration',
  prRedirect,
}: ITF_FormCodeProps) {
  const utStore = useUserStore();
  const utCensoredEmail = prEmail ? censorEmail(prEmail) : 'your email';
  const redirectPath =
    prRedirect ??
    (prMode === 'newsletter' ? '/users/unsubscribe-newsletter' : '/users/plans/select');
  const [code, setCode] = useState<Record<number, string>>({});
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [cooldown, setCooldown] = useState(REGISTRATION_RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { handleAlertOpen } = useAlert();

  const inputRefs = useRef(
    Array.from({ length: CODE_LENGTH }, () => createRef<HTMLInputElement>())
  );

  const isComplete = useMemo(
    () =>
      Object.keys(code).length === CODE_LENGTH &&
      [...Array(CODE_LENGTH).keys()].every((i) => code[i]?.length === 1),
    [code]
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((prev: number) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const setDigit = (pos: number, val: string) => {
    setCode((prev) => ({ ...prev, [pos]: val }));
  };

  const focusIndex = (i: number) => {
    if (i >= 0 && i < CODE_LENGTH) {
      setSelectedIdx(i);
      inputRefs.current[i].current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, pos: number) => {
    const raw = e.target.value.slice(-1);
    if (/\d/.test(raw)) {
      setDigit(pos, raw);
      focusIndex(pos + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, pos: number) => {
    if (e.key === 'Backspace') {
      if (code[pos]) {
        setDigit(pos, '');
      } else {
        focusIndex(pos - 1);
        setDigit(pos - 1, '');
      }
    }
    if (e.key === 'ArrowLeft') focusIndex(pos - 1);
    if (e.key === 'ArrowRight') focusIndex(pos + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, startPos: number) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!text) return;
    let i = startPos;
    for (const ch of text.slice(0, CODE_LENGTH - startPos)) {
      setDigit(i, ch);
      i++;
    }
    focusIndex(Math.min(startPos + text.length, CODE_LENGTH - 1));
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) {
      return;
    }
    setIsResending(true);
    try {
      if (prMode === 'newsletter') {
        const utTokenRes = (await utStore.post(
          'ActionSubscribeNewsletterRequest',
          {},
          true
        )) as Record<string, any>;
        if (utTokenRes?.uid) {
          setCooldown(REGISTRATION_RESEND_COOLDOWN_SECONDS);
          handleAlertOpen('Code sent', 'A new confirmation code has been sent.', 's');
        } else {
          handleAlertOpen(
            'An error occurred',
            'Could not resend the code. Please try again shortly.',
            'f'
          );
        }
      } else {
        const utTokenRes = (await utStore.post(
          'TokenVerificationRequest',
          { email: prEmail },
          true
        )) as Record<string, any>;
        if (utTokenRes?.uid) {
          setCooldown(REGISTRATION_RESEND_COOLDOWN_SECONDS);
          handleAlertOpen('Code sent', 'A new verification code has been sent.', 's');
        } else {
          handleAlertOpen(
            'An error occurred',
            'Could not resend the code. Please try again shortly.',
            'f'
          );
        }
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || isSubmitting) return;

    const value = Array.from({ length: CODE_LENGTH }, (_, i) => code[i]).join('');

    setIsSubmitting(true);
    try {
      if (prMode === 'newsletter') {
        const utValid = await utStore.post('ActionSubscribeNewsletterVerify', {
          token: value,
          uid: prUid,
        });

        if (!utValid) {
          const utError = utStore.getError('ActionSubscribeNewsletterVerify') as string | undefined;
          handleAlertOpen('An error occurred', utError || 'Wrong code. Try again.', 'f');
          return;
        }

        await utStore.get('PropertyConsents');
        handleAlertOpen('Success', 'Newsletter subscription confirmed.', 's');
        navigate(redirectPath);
        return;
      }

      const utValid = await utStore.post('ActionVerification', { token: value, uid: prUid });
      if (!utValid) {
        handleAlertOpen('An error occurred', 'Wrong code. Try again.', 'f');
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
      navigate(redirectPath);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendLabel = (() => {
    if (cooldown > 0) return `Resend code (${cooldown}s)`;
    if (isResending) return 'Resending...';
    return 'Resend code';
  })();

  const heading = prMode === 'newsletter' ? 'Confirm Subscription' : 'Verify Email';
  const instructions =
    prMode === 'newsletter'
      ? `We sent a six-digit code to ${utCensoredEmail}. Enter it below to confirm your subscription.`
      : `An email with a six-digit code has just been sent to ${utCensoredEmail}. Enter the code below.`;

  return (
    <>
      <h1 className="look-text-x4">{heading}</h1>
      <div className="area-flex-col look-div-subtle mod-padding-xl">
        <form className="look-form-auth" onSubmit={handleSubmit}>
          <p className="look-text-subtle look-text-x0">{instructions}</p>
          <div className="area-flex-row mod-gap-s">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                ref={inputRefs.current[i]}
                className="look-input-auth"
                value={code[i] ?? ''}
                aria-selected={selectedIdx === i}
                onFocus={() => setSelectedIdx(i)}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={(e) => handlePaste(e, i)}
                style={{
                  minWidth: 'unset',
                  maxWidth: `${scale(2.5)}`,
                  textAlign: 'center',
                  padding: `${scale(0.5)}`,
                }}
              />
            ))}
          </div>

          <div className="area-flex-col mod-gap-s mod-padding-none mod-align-stretch">
            <button
              className="look-button-secondary look-button-auth"
              disabled={!isComplete || isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </button>
            <button
              type="button"
              className="look-button-ghost mod-centersides"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
            >
              {resendLabel}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
