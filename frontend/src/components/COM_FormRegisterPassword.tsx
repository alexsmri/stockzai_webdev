import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import { REGISTRATION_PASSWORD_STORAGE_KEY } from '../constants';

interface ITF_FormRegisterPasswordProps {
  prEmail: string;
  prUsername: string;
}

const CONTINUE_LABEL = 'Create Account';

function COM_FormRegisterPassword({ prEmail, prUsername }: ITF_FormRegisterPasswordProps) {
  const [stPassword, setPassword] = useState('');
  const [stPasswordConfirm, setPasswordConfirm] = useState('');
  const [stConsentsNewsletter, setStConsentsNewsletter] = useState(false);
  const [stConsentsTos, setStConsentsTos] = useState(false);
  const [stLoading, setStLoading] = useState(false);

  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stPassword !== stPasswordConfirm) {
      handleAlertOpen('Passwords do not match.', 'f');
      return;
    }

    if (!stPassword) {
      handleAlertOpen('Please choose a password.', 'f');
      return;
    }

    if (!stConsentsTos) {
      handleAlertOpen('Please accept our privacy policy & terms to continue.', 'f');
      return;
    }

    setStLoading(true);
    try {
      const utRes = await utStore.post('ActionRegistration', {
        email: prEmail,
        username: prUsername,
        password: stPassword,
        consents: { consents_newsletter: stConsentsNewsletter, consents_tos: stConsentsTos },
      });

      if (!utRes) {
        const utError = utStore.getError('ActionRegistration') as string;
        handleAlertOpen(utError || 'Could not create your account. Please try again.', 'f', 5000);
        return;
      }

      const utTokenRes = (await utStore.post(
        'TokenVerificationRequest',
        { email: prEmail },
        true
      )) as Record<string, any> | null;
      if (!utTokenRes?.uid) {
        handleAlertOpen('Unable to send verification code. Please try again.', 'f', 5000);
        return;
      }

      try {
        window.sessionStorage.setItem(REGISTRATION_PASSWORD_STORAGE_KEY, stPassword);
      } catch (error) {
        console.error('Unable to persist temporary password for auto-login', error);
      }

      const params = new URLSearchParams({
        uid: utTokenRes.uid,
        email: prEmail,
        username: prUsername,
      });
      navigate(`/users/verification?${params.toString()}`);
    } finally {
      setStLoading(false);
    }
  };

  return (
    <>
      <h1 className="look-text-x4">Sign Up</h1>
      <div className="area-flex-col look-div-container mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <input
            type="password"
            value={stPassword}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="look-input-auth"
          />
          <input
            type="password"
            value={stPasswordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Repeat Password"
            className="look-input-auth"
          />
          <label
            className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none"
            style={{ maxWidth: '15rem' }}
          >
            <input
              type="checkbox"
              checked={stConsentsTos}
              onChange={(e) => setStConsentsTos(e.target.checked)}
            />
            I accept the privacy policy and terms of service.
          </label>
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
          <button className="look-button-auth" disabled={stLoading || !stConsentsTos}>
            {stLoading ? 'Creating Account...' : CONTINUE_LABEL}
          </button>
        </form>
        <div className="area-form-auth-links">
          <a href="/users/register" className="look-button-subtle">
            Change email or username
          </a>
        </div>
      </div>
    </>
  );
}

export default COM_FormRegisterPassword;
