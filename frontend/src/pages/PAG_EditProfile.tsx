import COM_FormEditProfile from "../components/COM_FormEditProfile";
import COM_Navbar from "../components/COM_Navbar";
import COM_Hero from "../components/COM_Hero";

function PAG_EditProfile() {
  return (
  <>
    <COM_Navbar />
    <COM_Hero>
      <COM_FormEditProfile/>
    </COM_Hero>
  </>
  );
}

export default PAG_EditProfile;
