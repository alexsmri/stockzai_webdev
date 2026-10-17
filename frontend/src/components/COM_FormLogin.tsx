import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useAlert } from '../context/CTX_Alert';
import COM_SocialButtons from './COM_SocialButtons';
import { APP_HOME_PATH } from '../constants';

function COM_FormLogin({ prRedirect = APP_HOME_PATH }: { prRedirect?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const utStore = useUserStore();
  const [searchParams] = useSearchParams();
  const prefillEmail = useMemo(
    () => (searchParams.get('prefill_email') ?? '').trim(),
    [searchParams]
  );
  const [stLoading, setStLoading] = useState(false);
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<Record<string, any> | null>(
    utStore.read('ActionLogin') as Record<string, any> | null
  );
  const { handleAlertOpen, handleAlertClose } = useAlert();

  const name = 'Login';

  useUserStoreSync(utStore, 'ActionLogin', setTokens);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  useEffect(() => {
    (async () => {
      if (tokens && tokens['access'] && tokens['refresh']) {
        const utValid = await utStore.post('TokenLoginValidation', { token: tokens['access'] });
        if (utValid) {
          utStore.get('PropertyCredentials');
          handleAlertClose();
          navigate(prRedirect);
        }
      }
    })();
  }, [tokens]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setStLoading(true);
    e.preventDefault();

    const utRes = await utStore.post('ActionLogin', { email, password });
    if (!utRes) {
      const utError = utStore.getError('ActionLogin') as string;
      utError && handleAlertOpen('An error occurred', utError, 'f');
    }
    setStLoading(false);
  };

  return (
    <div className="area-auth">
      <h1 className="look-text-x4">{name}</h1>

      <div className="area-flex-col look-div-subtle mod-align-stretch mod-padding-xl">
        {' '}
        <form onSubmit={handleSubmit} className="look-form-auth">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="look-input-auth"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="look-input-auth"
          />
          <button className="look-button-secondary mod-button-auth">
            {stLoading ? 'Logging In...' : 'Continue'}
          </button>
        </form>
        <COM_SocialButtons prRedirect={prRedirect} />
      </div>
      <div className="area-form-auth-links">
        <a href="/users/password-reset/token/request" className="look-button-subtle">
          Forgot Password?
        </a>
        <a href="/users/register" className="look-button-subtle">
          {"Don't have an account yet? "}
          <span className="look-priority-high">Sign Up</span>
        </a>
      </div>
    </div>
  );
}

export default COM_FormLogin;
