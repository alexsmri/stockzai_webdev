import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_FormSocialComplete from '../components/COM_FormSocialComplete';

export default function PAG_SocialComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionToken = searchParams.get('session_token');
  const email = searchParams.get('email');
  const username = searchParams.get('username') || '';
  const redirectParam = searchParams.get('redirect') || undefined;

  useEffect(() => {
    if (!sessionToken || !email) {
      navigate('/users/login', { replace: true });
    }
  }, [sessionToken, email, navigate]);

  const resolvedEmail = useMemo(() => email || '', [email]);

  if (!sessionToken || !resolvedEmail) {
    return null;
  }

  return (
    <>
      <COM_FormSocialComplete
        prEmail={resolvedEmail}
        prSessionToken={sessionToken}
        prPrefillUsername={username}
        prRedirect={redirectParam}
      />
      <COM_FooterAuth />
    </>
  );
}
