import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';
import COM_Footer from '../components/COM_Footer';
import COM_Winners from '../components/COM_Winners';
import { PRV_WinnerStore } from '../context/CTX_WinnerStore';

function PAG_Home() {
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <PRV_WinnerStore args={[]}>
          <COM_Winners />
        </PRV_WinnerStore>
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_Home;
