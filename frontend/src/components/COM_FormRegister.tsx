import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';

function COM_FormRegister() {
  const [stEmail, setStEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const utStore = useUserStore();
  const [, setLoading] = useState(false);
  const { handleAlertOpen } = useAlert();

  const name = 'Register';
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      const utRes = await utStore.post('ActionRegistration', {
        email: stEmail,
        username,
        password,
      });
      if (utRes) {
        const utTokenRes = await utStore.post('TokenVerificationRequest', { email: stEmail });
        if (utTokenRes) {
          handleAlertOpen('An Email has been sent to you to verify your account', 's', 5000);
        } else {
          handleAlertOpen(utStore.getError('ActionRegistration') as string, 'f', 5000);
        }
      } else {
        handleAlertOpen(utStore.getError('ActionRegistration') as string, 'f', 5000);
      }
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
          value={stEmail}
          onChange={(e) => setStEmail(e.target.value)}
          placeholder="Email"
          className="look-input-secondary"
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="look-input-secondary"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="look-input-secondary"
        />
        <button className="look-button-primary">{name}</button>
      </form>
    </>
  );
}

export default COM_FormRegister;
