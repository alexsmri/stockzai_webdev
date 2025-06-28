import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../context/CTX_UserStore";

function COM_FormRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const utStore = useUserStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = "Register";
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault()

    try {
      await utStore.post("ActionRegistration", {
            email,
            username,
            password,
          });
      utStore.update("PropertyCredentials", { email });
      navigate("/users/verification/token/request/");
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
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
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

export default COM_FormRegister;
