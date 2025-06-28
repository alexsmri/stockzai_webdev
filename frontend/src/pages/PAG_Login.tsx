import COM_FormLogin from "../components/COM_FormLogin";
import COM_Navbar from "../components/COM_Navbar";
import COM_Hero from "../components/COM_Hero";

function PAG_Login() {
  return (
  <>
    <COM_Navbar />
    <COM_Hero>
      <COM_FormLogin/>
    </COM_Hero>
  </>
  );
}

export default PAG_Login;
