import { useEffect } from "react";
import { useUserStore } from "../context/UserStoreContext";
import CO_Navbar from "../components/CO_Navbar";

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
      <CO_Navbar />
      <div className="look-text-x4">
        An E-Mail has been sent to you to verify your account
      </div>
      </>
    );
  }
