import COM_FormEditProfile from '../components/COM_FormEditProfile';
import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';
import COM_Footer from '../components/COM_Footer';

function PAG_EditProfile() {
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <COM_FormEditProfile />
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_EditProfile;
