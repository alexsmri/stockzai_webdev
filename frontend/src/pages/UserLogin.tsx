import CO_UserForm from "../components/CO_UserForm";

function UserLogin() {
  return <CO_UserForm prMethod="login" prRoute="/api/users/token/" />;
}

export default UserLogin;
