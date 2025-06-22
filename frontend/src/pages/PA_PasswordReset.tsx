import { useEffect, useState } from "react";
import { useUserStore } from "../context/UserStoreContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUserStoreSync } from "../hooks/hooks";
import CO_Navbar from "../components/CO_Navbar";

export default function PA_PasswordReset() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [valid, setValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Token Invalid");

  const utStore = useUserStore();
  const navigate = useNavigate();
  useUserStoreSync(utStore, "TokenPasswordResetValidation", setValid);
  useUserStoreSync(utStore, "ActionPasswordReset", setSuccess);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== password2) {
      setError("Passwords do not match!");
    } else {
      utStore.post("ActionPasswordReset", { uid, token, password });
    }
  };

  useEffect(() => {
    utStore.post("TokenPasswordResetValidation", { uid, token });
  }, [uid, token, email]);

  useEffect(() => {
    if (success) {
      setMessage("Password Reset successful!");
      setValid(false);
    }
  }, [success]);

  return (
    <>
    <CO_Navbar />
      {valid ? (
        <>
        <h1 className="look-text-x7">Reset Password</h1>
        <form onSubmit={handleSubmit} className="area-flex-col">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Email"
            className="look-input-primary"
          />
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="Password"
            className="look-input-primary"
          />
          <button className="look-button-primary">Submit</button>
        </form>
        </>
      ) : (
        <div>{message}</div>
      )}
    </>
  );
}
