import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';

export default function COM_FormSubscribe() {
  const navigate = useNavigate();
  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();

  const [stLoading, setStLoading] = useState(false);
  const [stEmail, setStEmail] = useState<string>('');
  const [stUsername, setStUsername] = useState<string>('');

  useEffect(() => {
    (async () => {
      const [consents, credentials] = await Promise.all([
        utStore.get('PropertyConsents'),
        utStore.get('PropertyCredentials'),
      ]);

      if (consents?.consents_newsletter) {
        navigate('/users/edit', { replace: true });
        return;
      }

      if (credentials) {
        setStEmail(credentials.email);
        setStUsername(credentials.username);
      }
    })();
  }, [navigate, utStore]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stLoading) {
      return;
    }

    setStLoading(true);
    try {
      const utRes = await utStore.post('ActionSubscribeNewsletterRequest', {}, true);
      if (utRes?.uid) {
        const params = new URLSearchParams({ uid: utRes.uid });
        if (stEmail) {
          params.set('email', stEmail);
        }
        if (stUsername) {
          params.set('username', stUsername);
        }
        handleAlertOpen('We just sent you a confirmation code.', 's');
        navigate(`/users/subscribe-newsletter/verify?${params.toString()}`);
      } else {
        handleAlertOpen('Could not start the subscription. Please try again.', 'f');
      }
    } finally {
      setStLoading(false);
    }
  };

  return (
    <>
      <h1 className="look-text-x4">Subscribe</h1>
      <div className="area-flex-col look-div-container mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <p className="look-text-subtle look-text-x0">
            We will send a one-time code to confirm your subscription to{' '}
            {stEmail || 'your account email'}.
          </p>
          <button className="look-button-auth" disabled={stLoading}>
            {stLoading ? 'Sending code...' : 'Send confirmation code'}
          </button>
        </form>
      </div>
    </>
  );
}
