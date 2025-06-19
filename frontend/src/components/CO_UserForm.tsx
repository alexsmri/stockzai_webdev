import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import CO_Hero from "./CO_Hero";
import { useUserStore } from "../context/UserStoreContext";

interface PI_UserForm {
  prRoute: string;
  prMethod: "login" | "register";
}

function CO_UserForm({ prRoute, prMethod }: PI_UserForm) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const utStore = useUserStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = prMethod === "login" ? "Login" : "Register";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res =
        prMethod === "login"
          ? await utStore.post("ActionLogin", { email, username, password })
          : await utStore.post("ActionRegistration", {
              email,
              username,
              password,
            });
      utStore.update("PropertyCredentials", {
        email: email,
        username: username,
      });
      if (prMethod === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        utStore.post("TokenVerificationRequest", { email });
        navigate("/users/verification/token/request/");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <CO_Hero>
        <h1 className="look-text-x7">{name}</h1>
        <form onSubmit={handleSubmit} className="area-flex-col">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="look-input-primary"
          />
          {prMethod === "register" && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="look-input-primary"
            />
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="look-input-primary"
          />
          <button className="look-button-primary">{name}</button>
        </form>
      </CO_Hero>
    </>
  );
}

export default CO_UserForm;
