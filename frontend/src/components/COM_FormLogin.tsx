import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useEffect } from 'react';
import { useAlert } from '../context/CTX_Alert';

function COM_FormLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const utStore = useUserStore();
  const [, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<Record<string, any> | null>(utStore.read('ActionLogin'));
  const { handleAlertOpen, handleAlertClose } = useAlert();

  const name = 'Login';

  useUserStoreSync(utStore, 'ActionLogin', setTokens);

  useEffect(() => {
    (async () => {
      if (tokens && tokens['access'] && tokens['refresh']) {
        const utValid = await utStore.post('TokenLoginValidation', { token: tokens['access'] });
        if (utValid) {
          utStore.get('PropertyCredentials');
          handleAlertClose();
          navigate('/');
        }
      }
    })();
  }, [tokens]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    const utRes = await utStore.post('ActionLogin', { email, password });
    if (!utRes) {
      const utError = utStore.getError('ActionLogin') as string;
      utError && handleAlertOpen(utError, 'f');
    }
    setLoading(false);
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

export default COM_FormLogin;
