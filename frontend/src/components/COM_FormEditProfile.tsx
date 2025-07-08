import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../context/CTX_UserStore";
import { useUserStoreSync } from "../hooks/hooks";
import COM_Alert from "./COM_Alert";

function COM_FormEditProfile() {
  const utStore = useUserStore();
  const navigate = useNavigate();

  const [stCredentials, setStCredentials] = useState<Record<string, any>>(utStore.read("PropertyCredentials"))
  const [, setStLoading] = useState(false);
  const [stSuccess, setStSuccess] = useState(false)
  const [stUsername, setStUsername] = useState<string>("");
  const [stShowAlert, setStShowAlert] = useState(false)
  const [stAlertType, setStAlertType] = useState<"success" | "failure" | "neutral">("neutral")
  const [stAlertMessage, setStAlertMessage] = useState("")
  
  useUserStoreSync(utStore, "PropertyCredentials", setStCredentials)
  const utInitialUsername = stCredentials ? stCredentials["username"] : "";
  const utName = "Edit Username";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStUsername(e.target.value)
    setStSuccess(false)
    setStShowAlert(false)
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setStLoading(true)
    e.preventDefault()
    if (stUsername) {
      if (stUsername === utInitialUsername) {
        setStShowAlert(true);
        setStAlertType("neutral");
        setStAlertMessage("Username is unchanged.");
        return;
      }

      const utRes = await utStore.post("ActionEditProfile", {
            username: stUsername,
          });
      setStSuccess(utRes)
      if (utRes) {
        setStShowAlert(true)
        setStAlertType("success")
        setStAlertMessage("Username changed successfully.")
        utStore.update("PropertyCredentials", { username: stUsername});
      } else {
        setStShowAlert(true)
        setStAlertType("failure")
        setStAlertMessage("Username already in use.")
      }
      setStLoading(false);
    }
  };

  useEffect(() => {
  if (!stCredentials || !utInitialUsername) {
    navigate("/");
  }
  }, [stCredentials]);
  
  useEffect(() => {
  if (stCredentials?.username) {
    setStUsername(stCredentials.username);
  }
  }, [stCredentials]);
  
  return (
    <>
      <COM_Alert prSignal={stShowAlert} prMessage={stAlertMessage} prType={stAlertType}/>
        <h1 className="look-text-x7">{utName}</h1>
        <form onSubmit={handleSubmit} className="area-flex-col">
          <input
            type="text"
            value={stUsername}
            onChange={(e) => handleChange(e)}
            placeholder={stSuccess ? stUsername : utInitialUsername}
            className="look-input-secondary"
          />
          <button className="look-button-primary">Save</button>
        </form>
    </>
  );
}

export default COM_FormEditProfile;
