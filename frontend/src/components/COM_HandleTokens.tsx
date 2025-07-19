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
    if (!tokens) {
      setStValid(true);
    }
    (async () => {
      try {
        await auth();
      } catch {
        return;
      }
    })();
  }, [tokens]);

  const refreshToken = async () => {
    if (tokens) {
      const refreshToken = tokens['refresh'];
      try {
        const refreshed = await utStore.post('ActionRefreshToken', {
          refresh: refreshToken,
        });
        if (
          refreshed &&
          utStore.read('ActionRefreshToken') &&
          utStore.read('ActionRefreshToken')['access']
        ) {
          utStore.update('ActionLogin', {
            refresh: refreshToken,
            access: utStore.read('ActionRefreshToken')['access'],
          });
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
      const decoded = jwtDecode<DecodedToken>(tokens['access']);
      const tokenExpiration = decoded.exp;

      const now = Date.now() / 1000;
      if (typeof tokenExpiration === 'number' && tokenExpiration < now) {
        await refreshToken();
      } else {
        const tokenValid = await utStore.post('TokenLoginValidation', {
          token: tokens['access'],
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

  if (!stValid) {
    utStore.clear('ActionLogin');
    utStore.clear('PropertyCredentials');
  }

  return props.children;
}

export default COM_HandleTokens;
