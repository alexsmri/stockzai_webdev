import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../context/UserStoreContext";
import { useUserStoreSync } from "../hooks/hooks";

export default function PA_Verication() {
  const { uid, token, email } = useParams();
  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState("Verifying...")
  const utStore = useUserStore()

  useUserStoreSync(utStore, "ActionVerification", setValid)

  utStore.post("ActionVerification", { uid, token, email })
  const navigate = useNavigate()

  useEffect(() => {
    const verify = () => {
      if (valid) {
        setMessage("Success!")
        navigate('/users/login')
      } else {
        setMessage("Invalid Verification Attempt")
        navigate('/');
      }
    };
    verify();
  }, [utStore]);

  return <div className="look-text-x4">{message}</div>;
}