import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import { useNavigate } from 'react-router-dom';

function COM_FormRegister() {
  const [stEmail, setStEmail] = useState('');
  const [stPassword, setPassword] = useState('');
  const [stUsername, setUsername] = useState('');
  const [stConsentsNewsletter, setStConsentsNewsletter] = useState(false);
  const utStore = useUserStore();
  const [, setLoading] = useState(false);
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();

  const name = 'Register';
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      const utRes = await utStore.post('ActionRegistration', {
        email: stEmail,
        username: stUsername,
        password: stPassword,
        consents: { consents_newsletter: stConsentsNewsletter },
      });
      if (utRes) {
        const utTokenRes = await utStore.post('TokenVerificationRequest', { email: stEmail }, true);
        console.log(utTokenRes);
        if (utTokenRes?.uid) {
          navigate(`/users/verification/?uid=${utTokenRes.uid}`);
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
      <>
        <h1 className="look-text-x7">{name}</h1>
        <form onSubmit={handleSubmit} className="area-flex-col mod-align-stretch">
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
          <label
            className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none"
            style={{ maxWidth: '15rem' }}
          >
            <input
              type="checkbox"
              checked={stConsentsNewsletter}
              onChange={(e) => setStConsentsNewsletter(e.target.checked)}
            />
            Get stockz.ai newsletter for product updates & special offers (can be canceled at any
            time)
          </label>
          <button className="look-button-primary mod-prevent-growth mod-center">{name}</button>
        </form>
        <a href="/users/login" className="look-button-subtle">
          Log In Instead
        </a>
      </>
    </>
  );
}

export default COM_FormRegister;
