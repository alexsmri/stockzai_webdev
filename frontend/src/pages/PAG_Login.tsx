import COM_FormLogin from '../components/COM_FormLogin';
import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';
import COM_Footer from '../components/COM_Footer';

function PAG_Login({ prRedirect = '/' }: { prRedirect?: string }) {
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <COM_FormLogin prRedirect={prRedirect} />
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_Login;
