import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useUserStore } from "../context/CTX_UserStore";
import { useUserStoreSync } from "../hooks/hooks";
import { useEffect } from "react";

function COM_FormLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utStore = useUserStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<Record<string, any> | null >(null)

  const name = "Login";
  
  useUserStoreSync(utStore, "ActionLogin", setTokens)

  useEffect(() => {
    console.log(tokens)
    if (tokens && tokens["access"] && tokens["refresh"]) {
    localStorage.setItem(ACCESS_TOKEN, tokens.access);
    localStorage.setItem(REFRESH_TOKEN, tokens.refresh);
    utStore.get("PropertyCredentials");
    navigate("/");
    }
  }, [tokens])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        
    setLoading(true);
    e.preventDefault();

    try {
      
      await utStore.post("ActionLogin", { email, password })
      
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
        <h1 className="look-text-x7">{name}</h1>
        <form onSubmit={handleSubmit} className="area-flex-col">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="look-input-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="look-input-primary"
          />
          <button className="look-button-primary">{name}</button>
        </form>
    </>
  );
}

export default COM_FormLogin;
