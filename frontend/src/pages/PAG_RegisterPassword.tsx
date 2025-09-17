import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_Hero from '../components/COM_Hero';
import COM_FormRegisterPassword from '../components/COM_FormRegisterPassword';
import COM_FooterAuth from '../components/COM_FooterAuth';

function PAG_RegisterPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') ?? '';
  const username = searchParams.get('username') ?? '';

  useEffect(() => {
    if (!email || !username) {
      navigate('/users/register', { replace: true });
    }
  }, [email, username, navigate]);

  if (!email || !username) {
    return null;
  }

  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormRegisterPassword prEmail={email} prUsername={username} />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}

export default PAG_RegisterPassword;
