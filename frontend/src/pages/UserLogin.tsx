import CO_FormLogin from "../components/CO_FormLogin";
import CO_Navbar from "../components/CO_Navbar";
import CO_Hero from "../components/CO_Hero";

function UserLogin() {
  return (
  <>
    <CO_Navbar />
    <CO_Hero>
      <CO_FormLogin/>
    </CO_Hero>
  </>
  );
}

export default UserLogin;
