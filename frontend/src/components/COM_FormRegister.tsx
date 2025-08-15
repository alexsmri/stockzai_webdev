import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import { useWindowDimensions } from '../hooks/hooks';
import { MOBILE_BREAKPOINT } from '../constants';

function COM_FormRegister() {
  const [stEmail, setStEmail] = useState('');
  const [stPassword, setPassword] = useState('');
  const [stUsername, setUsername] = useState('');
  const [stMobileSubmitted, setStMobileSubmitted] = useState(false);
  const utStore = useUserStore();
  const [, setLoading] = useState(false);
  const { handleAlertOpen } = useAlert();

  const { width } = useWindowDimensions();

  const name = 'Register';
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      const utRes = await utStore.post('ActionRegistration', {
        email: stEmail,
        username: stUsername,
        password: stPassword,
      });
      if (utRes) {
        const utTokenRes = await utStore.post('TokenVerificationRequest', { email: stEmail });
        if (utTokenRes) {
          width >= MOBILE_BREAKPOINT
            ? handleAlertOpen('An Email has been sent to you to verify your account', 's', 5000)
            : setStMobileSubmitted(true);
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
      {!stMobileSubmitted ? (
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
              value={stUsername}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="look-input-secondary"
            />
            <input
              type="password"
              value={stPassword}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="look-input-secondary"
            />
            <button className="look-button-primary">{name}</button>
          </form>
          <a href="/users/login" className="look-button-subtle">
            Log In Instead
          </a>
        </>
      ) : (
        <div className="area-flex-wrap">
          <h2 className="look-text-x3">An Email has been sent to you to verify your account</h2>
        </div>
      )}
    </>
  );
}

export default COM_FormRegister;
