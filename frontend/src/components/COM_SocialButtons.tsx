import { useState } from 'react';
import LOGO_Google from '@/assets/media/LOGO_Google.svg?react';
import { scale } from '../utils/functions';

interface ITF_SocialButtonsProps {
  prRedirect?: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GOOGLE_REDIRECT_URI =
  (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ||
  `${window.location.origin}/users/social/google/callback`;

export default function COM_SocialButtons({ prRedirect = '/' }: ITF_SocialButtonsProps) {
  const [stBusy, setStBusy] = useState(false);

  const generateRandomString = (length: number) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint32Array(length));
    return Array.from(values, (v) => charset[v % charset.length]).join('');
  };

  const sha256base64Url = async (input: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    const b64 = btoa(String.fromCharCode(...bytes));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const handleProvider = async () => {
    if (stBusy || !GOOGLE_CLIENT_ID) return;
    setStBusy(true);
    const state = crypto.randomUUID();
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await sha256base64Url(codeVerifier);

    sessionStorage.setItem('google_oauth_state', state);
    sessionStorage.setItem('google_oauth_redirect', prRedirect || '/');
    sessionStorage.setItem('google_oauth_code_verifier', codeVerifier);

    document.cookie = `google_oauth_state=${state}; path=/; SameSite=Lax${
      window.location.protocol === 'https:' ? '; Secure' : ''
    }`;

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'select_account',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
