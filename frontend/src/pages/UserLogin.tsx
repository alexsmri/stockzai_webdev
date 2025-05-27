import UserForm from "../components/UserForm"

function UserLogin () {
    return <UserForm method="login" route="/api/users/token/" />
}

export default UserLogin;