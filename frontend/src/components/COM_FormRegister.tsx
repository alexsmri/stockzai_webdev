import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAlert } from '../context/CTX_Alert';
import COM_SocialButtons from './COM_SocialButtons';

const CONTINUE_LABEL = 'Continue';

function COM_FormRegister() {
  const [searchParams] = useSearchParams();
  const prefillEmail = useMemo(
    () => (searchParams.get('prefill_email') ?? '').trim(),
    [searchParams]
  );
  const [stEmail, setStEmail] = useState('');
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (prefillEmail) {
      setStEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = stEmail.trim();

    if (!email) {
      handleAlertOpen('Missing email', 'Please provide an email to continue.', 'f');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      handleAlertOpen('Invalid email', 'Please enter a valid email address.', 'f');
      return;
    }

    const params = new URLSearchParams({ email });
    navigate(`/users/register/password?${params.toString()}`);
  };

  return (
    <>
      <h1 className="look-text-x4">Create your free account</h1>
      <p className="look-text-x1 look-priority-low mod-align-center">
        30-second signup - Get instant access to million-dollar insights
      </p>
      <div className="area-flex-col look-div-subtle mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <input
            type="email"
            value={stEmail}
            onChange={(e) => setStEmail(e.target.value)}
            placeholder="Email"
            className="look-input-auth"
          />
          <button className="look-button-secondary look-button-auth">{CONTINUE_LABEL}</button>
        </form>
        <COM_SocialButtons prRedirect="/users/plans/select" />
      </div>
      <div className="area-form-auth-links">
        <a href="/users/login" className="look-button-subtle">
          {'Already have an account? '}
          <span className="look-priority-high">Log In</span>
        </a>
      </div>
    </>
  );
}

export default COM_FormRegister;
