import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, type JSX } from 'react';
import COM_Loading from './COM_Loading';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

interface ITF_HandleTokenProps {
  children: JSX.Element;
}

interface DecodedToken {
  exp?: number;
  [key: string]: unknown;
}

function COM_HandleTokens(props: ITF_HandleTokenProps) {
  const utStore = useUserStore();

  const [stValid, setStValid] = useState<boolean | null>(null);
  const [tokens, setTokens] = useState<any>(utStore.read('ActionLogin'));
  useUserStoreSync(utStore, 'ActionLogin', setTokens);

  useEffect(() => {
    const hasAccessToken =
      tokens &&
      typeof tokens === 'object' &&
      tokens !== null &&
      typeof (tokens as Record<string, unknown>).access === 'string' &&
      (tokens as Record<string, unknown>).access;

    if (!hasAccessToken) {
      setStValid(true);
      return;
    }
    (async () => {
      try {
        await auth();
      } catch {
        return;
      }
    })();
  }, [tokens]);

  useEffect(() => {
    if (stValid === false) {
      utStore.clear('ActionLogin');
      utStore.clear('PropertyCredentials');
    }
  }, [stValid, utStore]);

  const refreshToken = async () => {
    if (tokens) {
      const refreshToken = tokens['refresh'];
      try {
        const refreshed = await utStore.post('ActionRefreshToken', {
          refresh: refreshToken,
        });
        const refreshedData = utStore.read('ActionRefreshToken') as { access?: unknown } | null;
        const refreshedAccess = typeof refreshedData?.access === 'string' ? refreshedData.access : null;

        if (refreshed && typeof refreshedAccess === 'string') {
          utStore.update('ActionLogin', { refresh: refreshToken, access: refreshedAccess });
          setStValid(true);
        } else {
          setStValid(false);
        }
      } catch (error) {
        setStValid(false);
      }
    }
  };

  const auth = async () => {
    if (tokens) {
      const accessToken = tokens['access'];
      if (typeof accessToken !== 'string' || !accessToken) {
        setStValid(false);
        return;
      }

      let decoded: DecodedToken;
      try {
        decoded = jwtDecode<DecodedToken>(accessToken);
      } catch {
        setStValid(false);
        return;
      }
      const tokenExpiration = decoded.exp;

      const now = Date.now() / 1000;
      if (typeof tokenExpiration === 'number' && tokenExpiration < now) {
        await refreshToken();
      } else {
        const tokenValid = await utStore.post('TokenLoginValidation', {
          token: accessToken,
        });
        if (tokenValid) {
          setStValid(true);
        } else {
          setStValid(false);
        }
      }
    }
  };

  if (stValid === null) {
    return <COM_Loading />;
  }

  return props.children;
}

export default COM_HandleTokens;
