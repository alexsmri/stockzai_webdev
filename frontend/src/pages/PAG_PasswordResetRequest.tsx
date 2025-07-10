import COM_Footer from '../components/COM_Footer';
import COM_FormPasswordResetRequest from '../components/COM_FormPasswordResetRequest';
import COM_Navbar from '../components/COM_Navbar';

export default function PAG_PasswordResetRequest() {
  return (
    <>
      <COM_Navbar />
      <COM_FormPasswordResetRequest />;
      <COM_Footer />
    </>
  );
}
