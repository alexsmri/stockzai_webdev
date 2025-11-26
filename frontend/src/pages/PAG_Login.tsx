import COM_FormLogin from '../components/COM_FormLogin';
import COM_FooterAuth from '../components/COM_FooterAuth';

function PAG_Login({ prRedirect = '/' }: { prRedirect?: string }) {
  return (
    <>
      <COM_FormLogin prRedirect={prRedirect} />
      <COM_FooterAuth />
    </>
  );
}

export default PAG_Login;
