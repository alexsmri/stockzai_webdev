import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function PA_VerifyEmail() {
  const { uid, token } = useParams();
  const [message, setMessage] = useState("Verifying...");
    const navigate = useNavigate()

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/api/users/verify-email/${uid}/${token}/`);
        navigate('/users/login')
      } catch {
        navigate('/');
        setMessage("Invalid verification attempt.")
      }
    };
    verify();
  }, [uid, token]);

  return <div className="look-text-x4">{message}</div>;
}