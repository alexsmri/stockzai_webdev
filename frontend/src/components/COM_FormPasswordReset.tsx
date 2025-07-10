import { useEffect, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStoreSync } from '../hooks/hooks';
import { useAlert } from '../context/CTX_Alert';
import COM_Loading from './COM_Loading';

export default function COM_FormPasswordReset() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [success, setSuccess] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const { handleAlertOpen } = useAlert();

  const utStore = useUserStore();
  useUserStoreSync(utStore, 'TokenPasswordResetValidation', setValid);
  useUserStoreSync(utStore, 'ActionPasswordReset', setSuccess);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== password2) {
      handleAlertOpen('Passwords do not match', 'w');
    } else {
      const utRes = await utStore.post('ActionPasswordReset', { uid, token, password });
      if (utRes) {
        setSuccess(true);
      } else {
        setSuccess(false);
        handleAlertOpen(utStore.getError('ActionPasswordReset') as string, 'f');
      }
    }
  };

  useEffect(() => {
    (async () => {
      const utRes = await utStore.post('TokenPasswordResetValidation', { uid, token });
      if (utRes) {
        setValid(true);
      } else {
        setValid(false);
      }
    })();
  }, [uid, token]);

  useEffect(() => {
    if (success) {
      handleAlertOpen('Password Reset successful!', 's');
      navigate('/users/login/');
      setValid(false);
    }
  }, [success]);

  return (
    <>
      {valid === null && <COM_Loading />}
      {valid === false && <div className="look-text-x2">Token Invalid.</div>}
      {valid === true && (
        <>
          <h1 className="look-text-x7">Reset Password</h1>
          <form onSubmit={handleSubmit} className="area-flex-col">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="look-input-primary"
            />
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repeat Password"
              className="look-input-primary"
            />
            <button className="look-button-primary">Submit</button>
          </form>
        </>
      )}
    </>
  );
}
