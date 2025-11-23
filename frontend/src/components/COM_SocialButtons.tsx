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

declare global {
  interface Window {
    stockzSocial?: {
      getIdToken?: (provider: 'google') => Promise<string | null> | string | null;
    };
  }
}

export default function COM_SocialButtons({ prRedirect = '/' }: ITF_SocialButtonsProps) {
  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();
  const [stBusy, setStBusy] = useState(false);

  const resolveIdToken = async () => {
    try {
      if (window.stockzSocial?.getIdToken) {
        const token = await window.stockzSocial.getIdToken('google');
        if (token) return token;
      }
    } catch (err) {
      console.error('Failed to read provider token', err);
    }
    const fallback = window.prompt('Paste the Google ID token to continue:');
    return fallback ? fallback.trim() : null;
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
