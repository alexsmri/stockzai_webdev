import Logo from "@/assets/media/LOGO_schwarzquer.svg?react";
import { useUserStore } from "../context/CTX_UserStore";
import { useUserStoreSync } from "../hooks/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function COM_Navbar() {
    const utStore = useUserStore()
    const [loggedIn, setLoggedIn] = useState(utStore.read("ActionLogin"))

    useUserStoreSync(utStore, "PropertyCredentials", setLoggedIn)
    const navigate = useNavigate()

    return (
        <>
        <div className="area-flex-row mod-space-between">
            <Logo className="img-logo mod-cursor-pointer" onClick={() => {navigate("/")}}/>
            <div className="area-flex-row mod-gap-xl">
                <a href="/companies/search/" className="look-button-ghost">Search</a>
                <a href="/companies/compare/" className="look-button-ghost">Compare</a>
                {loggedIn ?
                <>
                    <a href="/users/edit" className="look-button-ghost">Profile</a>
                </>
                : <>
                    <a href="/users/login/" className="look-button-ghost">Log In</a>
                    <a href="/users/register/" className="look-button-ghost">Sign Up</a>
                </>
                }

            </div>
        </div>
        </>
    )
}