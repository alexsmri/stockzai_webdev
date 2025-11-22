import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_FormRegisterPassword from '../components/COM_FormRegisterPassword';
import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_Hero from '../components/COM_Hero';

function PAG_RegisterPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') ?? '';
  const prefillUsername = searchParams.get('username') ?? '';

  useEffect(() => {
    if (!email) {
      navigate('/users/register', { replace: true });
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormRegisterPassword prEmail={email} prPrefillUsername={prefillUsername} />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}

export default PAG_RegisterPassword;
