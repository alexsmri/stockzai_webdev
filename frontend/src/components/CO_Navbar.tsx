import Logo from "@/assets/media/LOGO_schwarzquer.svg?react";

export default function CO_Navbar() {
    return (
        <>
        <div className="area-flex-row mod-space-between">
            <Logo className="img-logo"/>
            <div className="area-flex-row mod-gap-l">
                <a href="" className="look-button-ghost">Login</a>
                <a href="" className="look-button-ghost">Test</a>
                <a href="" className="look-button-ghost">Test</a>
            </div>
        </div>
        </>
    )
}