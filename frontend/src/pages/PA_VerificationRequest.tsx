import { useEffect } from "react";
import { useUserStore } from "../context/UserStoreContext";

export default function PA_VericationRequest() {
  const utStore = useUserStore();
    const email = utStore.read("PropertyCredentials");
  
    useEffect(() => {
      utStore.post("TokenPasswordResetRequest", { email });
    }, [email]);
  
    return (
      <div className="look-text-x4">
        An E-Mail has been sent to you to reset your password
      </div>
    );
  }
