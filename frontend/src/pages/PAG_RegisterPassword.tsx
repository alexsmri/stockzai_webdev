import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import COM_FormRegisterPassword from '../components/COM_FormRegisterPassword';
import COM_AuthShowcase from '../components/COM_AuthShowcase';
import IMG_ApplicationDemo from '../assets/media/IMG_ApplicationDemo.webp';

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
      <COM_AuthShowcase prScreenshotSrc={IMG_ApplicationDemo}>
        <COM_FormRegisterPassword prEmail={email} prPrefillUsername={prefillUsername} />
      </COM_AuthShowcase>
    </>
  );
}

export default PAG_RegisterPassword;
