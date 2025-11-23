import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_FormCodeSubscribe from '../components/COM_FormCodeSubscribe';
import COM_Hero from '../components/COM_Hero';
import { useUserStore } from '../context/CTX_UserStore';
import COM_FooterAuth from '../components/COM_FooterAuth';

export default function PAG_SubscribeVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const utStore = useUserStore();

  const uid = searchParams.get('uid');
  const emailParam = searchParams.get('email');
  const usernameParam = searchParams.get('username');

  const [stEmail, setStEmail] = useState<string>('');
  const [stUsername, setStUsername] = useState<string>('');

  useEffect(() => {
    if (!uid) {
      navigate('/users/subscribe-newsletter', { replace: true });
    }
  }, [navigate, uid]);

  useEffect(() => {
    (async () => {
      const consents = (await utStore.get('PropertyConsents')) as null | Record<string, any>;
      if (consents?.consents_newsletter) {
        navigate('/users/unsubscribe-newsletter', { replace: true });
        return;
      }

      const credentials = (await utStore.get('PropertyCredentials')) as null | Record<string, any>;
      if (credentials) {
        setStEmail(credentials.email);
        setStUsername(credentials.username);
      }
    })();
  }, [navigate, utStore]);

  const resolvedEmail = useMemo(() => emailParam || stEmail, [emailParam, stEmail]);
  const resolvedUsername = useMemo(() => usernameParam || stUsername, [usernameParam, stUsername]);

  if (!uid) {
    return null;
  }

  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormCodeSubscribe
          prUid={uid}
          prEmail={resolvedEmail}
          prUsername={resolvedUsername}
          prRedirect="/"
        />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
