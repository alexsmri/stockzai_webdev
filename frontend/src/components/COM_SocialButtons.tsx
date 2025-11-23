import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import type { ValidKeys } from '../stores/STO_Users';

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
        callback: (resp: { credential?: string | null }) => void;
      }) => void;
      prompt: (
        handler?: (notification: {
          isNotDisplayed: () => boolean;
          isSkippedMoment: () => boolean;
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
    if (!GOOGLE_CLIENT_ID) {
      handleAlertOpen('Configuration error', 'Google client ID is missing.', 'f');
      return null;
    }

    try {
      const googleSdk = await loadGoogleSdk();
      return await new Promise<string | null>((resolve, reject) => {
        try {
          googleSdk.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (resp) => resolve(resp.credential ?? null),
          });
          googleSdk.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              reject(new Error('Google prompt was not displayed or skipped.'));
            }
          });
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      console.error('Failed to load Google SDK or get credential', err);
      return null;
    }
  };

  const handleProvider = async () => {
    const actionKey: ValidKeys = 'ActionSocialGoogle';
    const idToken = await resolveIdToken();
    if (!idToken) {
      handleAlertOpen('Action required', 'A valid provider token is required to continue.', 'f');
      return;
    }
    setStBusy(true);
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

      await utStore.get('PropertyCredentials');
      handleAlertOpen('Success', 'You are now signed in.', 's');
      navigate(prRedirect);
    } finally {
      setStBusy(false);
    }
  };

  return (
    <div className="area-flex-col mod-gap-s">
      <button
        type="button"
        className="look-button-ghost look-button-auth"
        onClick={handleProvider}
        disabled={stBusy}
      >
        {stBusy ? 'Connecting to Google...' : 'Continue with Google'}
      </button>
    </div>
  );
}
