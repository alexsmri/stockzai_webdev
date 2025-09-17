import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/CTX_Alert';
import { useUserStore } from '../context/CTX_UserStore';

const CONTINUE_LABEL = 'Continue';

function COM_FormRegister() {
  const utStore = useUserStore();
  const [stEmail, setStEmail] = useState('');
  const [stUsername, setStUsername] = useState('');
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = stEmail.trim();
    const username = stUsername.trim();

    if (!email || !username) {
      handleAlertOpen('Please provide both email and username to continue.', 'f');
      return;
    }
    const utValid = await utStore.post('ActionRegistrationCheck', {
      email: email,
      username: username,
    });
    if (utValid) {
      const params = new URLSearchParams({ email, username });
      navigate(`/users/register/password?${params.toString()}`);
    } else {
      handleAlertOpen(utStore.getError('ActionRegistrationCheck') as string, 'f');
    }
  };

  return (
    <>
      <h1 className="look-text-x4">Sign Up</h1>
      <div className="area-flex-col look-div-container mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <input
            type="email"
            value={stEmail}
            onChange={(e) => setStEmail(e.target.value)}
            placeholder="Email"
            className="look-input-secondary"
          />
          <input
            type="text"
            value={stUsername}
            onChange={(e) => setStUsername(e.target.value)}
            placeholder="Username"
            className="look-input-secondary"
          />
          <button className="look-button-auth">{CONTINUE_LABEL}</button>
        </form>
        <div className="area-form-auth-links">
          <a href="/users/login" className="look-button-subtle">
            Log In Instead
          </a>
        </div>
      </div>
    </>
  );
}

export default COM_FormRegister;
