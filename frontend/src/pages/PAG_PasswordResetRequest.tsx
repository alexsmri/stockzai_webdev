import COM_Footer from '../components/COM_Footer';
import COM_FormPasswordResetRequest from '../components/COM_FormPasswordResetRequest';
import COM_Hero from '../components/COM_Hero';
import COM_Navbar from '../components/COM_Navbar';

export default function PAG_PasswordResetRequest() {
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <COM_FormPasswordResetRequest />
      </COM_Hero>
      <COM_Footer />
    </>
  );
}
