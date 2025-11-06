import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, type JSX } from 'react';
import COM_Loading from './COM_Loading';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import PAG_Login from '../pages/PAG_Login';
import PAG_Register from '../pages/PAG_Register';

interface DecodedToken {
  exp?: number;
  [key: string]: unknown;
}

function COM_ProtectedRoute({ children }: { children: JSX.Element }) {
  const utLocation = useLocation();
  const utRedirect = utLocation.pathname;
  const utStore = useUserStore();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [tokens, setTokens] = useState<any>(utStore.read('ActionLogin'));
  useUserStoreSync(utStore, 'ActionLogin', setTokens);
  const [isNewUser, setIsNewUser] = useState<boolean>(Boolean(utStore.read('PropertyNewUser')));
  useUserStoreSync(utStore, 'PropertyNewUser', (value) => setIsNewUser(Boolean(value)));

  useEffect(() => {
    (async () => {
      try {
        await auth();
      } catch {
        setIsAuthorized(false);
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
        const refreshedPayload = utStore.read('ActionRefreshToken') as { access?: string } | null;
        const refreshedAccess =
          typeof refreshedPayload?.access === 'string' ? refreshedPayload.access : null;

        if (refreshed && refreshedAccess) {
          utStore.update('ActionLogin', {
            refresh: refreshToken,
            access: refreshedAccess,
          });
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
      return;
    }
  };

  const auth = async () => {
    if (!tokens) {
      setIsAuthorized(false);
      return;
    } else {
      const decoded = jwtDecode<DecodedToken>(tokens['access']);
      const tokenExpiration = decoded.exp;

      const now = Date.now() / 1000;
      if (typeof tokenExpiration === 'number' && tokenExpiration < now) {
        await refreshToken();
      } else {
        const tokenValid = await utStore.post('TokenLoginValidation', { token: tokens['access'] });
        if (tokenValid) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      }
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      utStore.set('PropertyNewUser', false);
    }
  }, [isAuthorized, utStore]);

  if (isAuthorized === null) {
    return <COM_Loading />;
  }

  if (isAuthorized) {
    return children;
  }

  return isNewUser ? <PAG_Register /> : <PAG_Login prRedirect={utRedirect} />;
}

export default COM_ProtectedRoute;
