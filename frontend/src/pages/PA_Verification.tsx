import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../context/UserStoreContext";
import { useUserStoreSync } from "../hooks/hooks";

export default function PA_Verication() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  console.log(uid, token, email);

  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState("Verifying...");
  const utStore = useUserStore();
  const navigate = useNavigate();
  useUserStoreSync(utStore, "ActionVerification", setValid);

  useEffect(() => {
    utStore.post("ActionVerification", { uid, token, email });
  }, [uid, token, email]);

  useEffect(() => {
    const verify = async () => {
      if (valid) {
        setMessage("Success!");
        navigate("/users/login");
      } else {
        setMessage("Invalid Verification Attempt");
        navigate("/");
      }
    };
    verify();
  }, [utStore]);

  return <div className="look-text-x4">{message}</div>;
}
