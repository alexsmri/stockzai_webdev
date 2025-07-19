import COM_Footer from '../components/COM_Footer';
import COM_FormRegister from '../components/COM_FormRegister';
import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';

function PAG_Register() {
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <COM_FormRegister />
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_Register;
