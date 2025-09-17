import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_Hero from '../components/COM_Hero';
import COM_FormCode from '../components/COM_FormCode';
import COM_FooterAuth from '../components/COM_FooterAuth';

export default function PAG_VericationCode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid');
  const email = searchParams.get('email');
  const username = searchParams.get('username');

  useEffect(() => {
    if (!uid || !email || !username) {
      navigate('/users/register', { replace: true });
    }
  }, [uid, email, username, navigate]);

  if (!uid || !email || !username) {
    return null;
  }

  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormCode prUid={uid} prEmail={email} prUsername={username} />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
