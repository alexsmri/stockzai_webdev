import { useEffect } from "react";
import { useUserStore } from "../context/CTX_UserStore";
import COM_Navbar from "../components/COM_Navbar";

export default function PA_VericationRequest() {
  const utStore = useUserStore();
    const credentials = utStore.read("PropertyCredentials");
  
    useEffect(() => {
      if (credentials["email"]) {
        utStore.post("TokenVerificationRequest", { email: credentials["email"] });
      }
    }, [credentials]);
  
    return (
      <>
      <COM_Navbar />
      <div className="look-text-x4">
        An E-Mail has been sent to you to verify your account
      </div>
      </>
    );
  }
