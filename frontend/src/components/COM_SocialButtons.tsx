import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import type { ValidKeys } from '../stores/STO_Users';
import LOGO_Google from '@/assets/media/LOGO_Google.svg?react';
import { scale } from '../utils/functions';

type TYP_GoogleAuthResponse =
  | {
      access: string;
      refresh: string;
      needs_verification?: false;
      needs_profile?: false;
      uid?: string;
      email?: string;
      session_token?: string;
    }
  | {
      needs_verification: true;
      uid: string;
      email: string;
      session_token: string;
      needs_profile?: false;
      access?: string;
      refresh?: string;
    }
  | {
      needs_profile: true;
      session_token: string;
      email: string;
      needs_verification?: false;
      uid?: string;
      access?: string;
      refresh?: string;
    };

interface ITF_SocialButtonsProps {
  prRedirect?: string;
}

type GoogleIdentitySdk = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        ux_mode?: 'popup' | 'redirect';
        use_fedcm_for_prompt?: boolean;
        callback: (resp: { credential?: string | null }) => void;
      }) => void;
      prompt: (
        handler?: (notification: {
          isNotDisplayed: () => boolean;
          isSkippedMoment: () => boolean;
          getNotDisplayedReason?: () => string | null;
          getSkippedReason?: () => string | null;
        }) => void
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentitySdk;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let pendingGoogleCredential: Promise<string | null> | null = null;

const loadGoogleSdk = (): Promise<GoogleIdentitySdk> =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const existing = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google!));
      existing.addEventListener('error', () => reject(new Error('Failed to load Google SDK')));
      return;
    }
    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
      } else {
        reject(new Error('Google SDK unavailable after load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google SDK'));
    document.head.appendChild(script);
  });

export default function COM_SocialButtons({ prRedirect = '/' }: ITF_SocialButtonsProps) {
  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();
  const [stBusy, setStBusy] = useState(false);

  const resolveIdToken = async () => {
    if (pendingGoogleCredential) {
      return pendingGoogleCredential;
    }
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google client ID is missing. Check VITE_GOOGLE_CLIENT_ID.');
      handleAlertOpen('Configuration error', 'Google client ID is missing.', 'f');
      return null;
    }

    try {
      const googleSdk = await loadGoogleSdk();

      pendingGoogleCredential = new Promise<string | null>((resolve) => {
        let settled = false;

        const finishResolve = (value: string | null) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        };

        googleSdk.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
          callback: (resp) => finishResolve(resp.credential ?? null),
        });

        googleSdk.accounts.id.prompt((notification) => {
          const skipped = notification.isSkippedMoment();
          const notDisplayed = notification.isNotDisplayed();
          if (skipped || notDisplayed) {
            const skippedReason = notification.getSkippedReason?.();
            const notDisplayedReason = notification.getNotDisplayedReason?.();
            console.warn('Google prompt did not return credential', {
              skipped,
              skippedReason,
              notDisplayed,
              notDisplayedReason,
            });
            finishResolve(null);
          }
        });
      });
      return await pendingGoogleCredential;
    } catch (err) {
      console.error('Failed to load Google SDK or get credential', err);
      return null;
    } finally {
      pendingGoogleCredential = null;
    }
  };

  const handleProvider = async () => {
    if (stBusy) return;
    setStBusy(true);
    const actionKey: ValidKeys = 'ActionSocialGoogle';
    const idToken = await resolveIdToken();
    if (!idToken) {
      setStBusy(false);
      handleAlertOpen('Action required', 'A valid provider token is required to continue.', 'f');
      return;
    }
    try {
      const utRes = (await utStore.post(actionKey, { id_token: idToken }, true)) as
        | TYP_GoogleAuthResponse
        | false
        | null;
      if (!utRes) {
        const utError = utStore.getError(actionKey) as string | undefined;
        handleAlertOpen('Unable to continue', utError || 'Please try again.', 'f');
        return;
      }

      if (utRes.needs_verification && utRes.uid) {
        const params = new URLSearchParams({
          uid: utRes.uid,
          email: utRes.email,
          provider: 'google',
          session_token: utRes.session_token || '',
          redirect: prRedirect || '/',
        });
        navigate(`/users/verification?${params.toString()}`);
        return;
      }

      if (utRes.needs_profile && utRes.session_token) {
        const params = new URLSearchParams({
          session_token: utRes.session_token,
          email: utRes.email,
          redirect: prRedirect || '/',
        });
        navigate(`/users/social/complete?${params.toString()}`);
        return;
      }

      if (utRes.access && utRes.refresh) {
        utStore.set('ActionLogin', { access: utRes.access, refresh: utRes.refresh });
      }

      await utStore.get('PropertyCredentials');
      const status = (await utStore.get('PropertyStatus')) as {
        completed_onboarding?: boolean;
      } | null;
      const target =
        (status && status.completed_onboarding && '/companies/search') || prRedirect || '/';
      handleAlertOpen('Success', 'You are now signed in.', 's');
      navigate(target);
    } finally {
      setStBusy(false);
    }
  };

  return (
    <>
      <p className="look-text-x0 look-priority-low mod-centersides" style={{ marginTop: scale(1) }}>
        OR
      </p>
      <div className="area-flex-col mod-padding-none mod-align-stretch mod-gap-s">
        <button
          type="button"
          className="area-flex-row mod-align-center look-button-tertiary mod-button-auth"
          style={{ justifyContent: 'center' }}
          onClick={handleProvider}
          disabled={stBusy}
        >
          <span aria-hidden="true" style={{ display: 'inline-flex' }}>
            <LOGO_Google style={{ width: scale(2), height: 'auto' }} />
          </span>
          {stBusy ? 'Connecting to Google...' : 'Continue with Google'}
        </button>
      </div>
    </>
  );
}
