import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import COM_Loading from '../components/COM_Loading';
import type { ValidKeys } from '../stores/STO_Users';

const GOOGLE_REDIRECT_URI =
  (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ||
  `${window.location.origin}/users/social/google/callback`;

export default function PAG_SocialGoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();
  const [busy, setBusy] = useState(true);

  const code = searchParams.get('code') || '';
  const stateParam = searchParams.get('state') || '';
  const error = searchParams.get('error');

  const storedState = useMemo(() => sessionStorage.getItem('google_oauth_state') || '', []);
  const storedRedirect = useMemo(() => sessionStorage.getItem('google_oauth_redirect') || '/', []);
  const codeVerifier = useMemo(
    () => sessionStorage.getItem('google_oauth_code_verifier') || '',
    []
  );
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;
    (async () => {
      if (error) {
        handleAlertOpen('Google sign-in canceled', error, 'w');
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('google_oauth_redirect');
        sessionStorage.removeItem('google_oauth_code_verifier');
        navigate('/users/login');
        return;
      }

      if (!code || !stateParam || stateParam !== storedState) {
        handleAlertOpen('Unable to continue', 'Invalid or missing authorization response.', 'f');
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('google_oauth_redirect');
        sessionStorage.removeItem('google_oauth_code_verifier');
        navigate('/users/login');
        return;
      }

      const actionKey: ValidKeys = 'ActionSocialGoogle';
      const payload = {
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        state: stateParam,
        code_verifier: null as null | string,
      };
      if (codeVerifier) {
        payload['code_verifier'] = codeVerifier;
      }

      const utRes = (await utStore.post(actionKey, payload, true)) as
        | Record<string, any>
        | null
        | false;
      if (!utRes) {
        const utError = utStore.getError(actionKey) as string | undefined;
        handleAlertOpen('Unable to continue', utError || 'Please try again.', 'f');
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('google_oauth_redirect');
        sessionStorage.removeItem('google_oauth_code_verifier');
        navigate('/users/login');
        return;
      }

      if (utRes.needs_verification && utRes.uid) {
        const params = new URLSearchParams({
          uid: utRes.uid,
          email: utRes.email,
          provider: 'google',
          session_token: utRes.session_token || '',
          redirect: storedRedirect || '/',
        });
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('google_oauth_redirect');
        sessionStorage.removeItem('google_oauth_code_verifier');
        navigate(`/users/verification?${params.toString()}`);
        return;
      }

      if (utRes.needs_profile && utRes.session_token) {
        const params = new URLSearchParams({
          session_token: utRes.session_token,
          email: utRes.email,
          redirect: storedRedirect || '/',
        });
        sessionStorage.removeItem('google_oauth_state');
        sessionStorage.removeItem('google_oauth_redirect');
        sessionStorage.removeItem('google_oauth_code_verifier');
        navigate(`/users/social/complete?${params.toString()}`);
        return;
      }

      if (utRes.access && utRes.refresh) {
        utStore.set('ActionLogin', { access: utRes.access, refresh: utRes.refresh });
      }

      await utStore.get('PropertyCredentials');
      const status = (await utStore.get('PropertyStatus')) as
        | { completed_onboarding?: boolean }
        | null;
      const target = status?.completed_onboarding
        ? storedRedirect || '/'
        : '/onboarding/choose-ticker';
      handleAlertOpen('Success', 'You are now signed in.', 's');
      sessionStorage.removeItem('google_oauth_state');
      sessionStorage.removeItem('google_oauth_redirect');
      sessionStorage.removeItem('google_oauth_code_verifier');
      navigate(target);
    })().finally(() => setBusy(false));
  }, [code, error, handleAlertOpen, navigate, stateParam, storedRedirect, storedState, utStore]);

  return (
    <div className="area-auth look-div-subtle mod-padding-xl">
      <h1 className="look-text-x4">Connecting to Google...</h1>
      {busy && <COM_Loading />}
    </div>
  );
}
