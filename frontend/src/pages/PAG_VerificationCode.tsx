import COM_Navbar from '../components/COM_Navbar';
import COM_Footer from '../components/COM_Footer';
import COM_Hero from '../components/COM_Hero';
import COM_FormCode from '../components/COM_FormCode';

export default function PAG_VericationCode() {
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <COM_FormCode />
      </COM_Hero>
      <COM_Footer />
    </>
  );
}
