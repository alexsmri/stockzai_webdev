import COM_Footer from '../components/COM_Footer';
import COM_FormPasswordReset from '../components/COM_FormPasswordReset';
import COM_Hero from '../components/COM_Hero';
import COM_Navbar from '../components/COM_Navbar';

function PAG_PasswordReset() {
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <COM_FormPasswordReset />
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_PasswordReset;
