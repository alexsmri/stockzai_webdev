import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../context/UserStoreContext";
import { useUserStoreSync } from "../hooks/hooks";
import CO_Navbar from "../components/CO_Navbar";

export default function PA_Verication() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState("Verifying...");
  const utStore = useUserStore();
  const navigate = useNavigate();
  useUserStoreSync(utStore, "ActionVerification", setValid);

  useEffect(() => {
    utStore.post("ActionVerification", { uid, token });
  }, [uid, token]);

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

  return <><CO_Navbar /><div className="look-text-x4">{message}</div></>;
}
