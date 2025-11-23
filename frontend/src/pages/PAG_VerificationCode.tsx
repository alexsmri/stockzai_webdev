import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_Hero from '../components/COM_Hero';
import COM_FormCodeVerify from '../components/COM_FormCodeVerify';
import COM_FooterAuth from '../components/COM_FooterAuth';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';

export default function PAG_VericationCode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();

  const uid = searchParams.get('uid');
  const email = searchParams.get('email');
  const username = searchParams.get('username');
  const sessionToken = searchParams.get('session_token');
  const redirectParam = searchParams.get('redirect') ?? undefined;

  useEffect(() => {
    const isSocialLink = Boolean(sessionToken);
    if (!uid || !email || (!username && !isSocialLink)) {
      navigate(isSocialLink ? '/users/login' : '/users/register', { replace: true });
    }
  }, [uid, email, username, sessionToken, navigate]);

  const isSocialLink = useMemo(() => Boolean(sessionToken), [sessionToken]);

  if (!uid || !email || (!username && !isSocialLink)) {
    return null;
  }

  const handleSocialLinkSuccess = async (result: any) => {
    if (result?.needs_profile && result.session_token) {
      const params = new URLSearchParams({
        session_token: result.session_token,
        email,
        provider: searchParams.get('provider') || '',
        redirect: redirectParam || '',
      });
      navigate(`/users/social/complete?${params.toString()}`);
      return;
    }

    await utStore.get('PropertyCredentials');
    handleAlertOpen('Welcome back', username ? `Welcome, ${username}` : 'Welcome!', 's');
    navigate(redirectParam || '/');
  };

  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormCodeVerify
          prUid={uid}
          prEmail={email}
          prUsername={username || undefined}
          prRedirect={redirectParam}
          prSubmitKey={isSocialLink ? 'ActionSocialLinkVerify' : 'ActionVerification'}
          prResendKey="TokenVerificationRequest"
          prExtraPayload={sessionToken ? { session_token: sessionToken } : undefined}
          prOnSuccess={isSocialLink ? handleSocialLinkSuccess : undefined}
        />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
