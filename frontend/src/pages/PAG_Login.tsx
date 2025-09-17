import COM_FormLogin from '../components/COM_FormLogin';
import COM_Hero from '../components/COM_Hero';
import COM_FooterAuth from '../components/COM_FooterAuth';

function PAG_Login({ prRedirect = '/' }: { prRedirect?: string }) {
  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormLogin prRedirect={prRedirect} />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}

export default PAG_Login;
