import { useEffect, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useAlert } from '../context/CTX_Alert';
import COM_Loading from './COM_Loading';

interface EditProfileResponse {
  email: string;
  username: string;
  consents?: {
    consents_newsletter?: boolean;
    consents_tos?: boolean;
    consents_information_only?: boolean;
  } | null;
}

function COM_FormEditProfile() {
  const utStore = useUserStore();

  const [stCredentials, setStCredentials] = useState<Record<string, any> | null>(
    utStore.read('PropertyCredentials') ?? null
  );
  const [stConsents, setStConsents] = useState<Record<string, any> | null>(
    utStore.read('PropertyConsents') ?? null
  );
  const [, setStLoading] = useState(false);
  const [stSuccess, setStSuccess] = useState(false);
  const [stUsername, setStUsername] = useState<string>('');

  const { handleAlertOpen, handleAlertClose } = useAlert();

  useUserStoreSync(utStore, 'PropertyCredentials', setStCredentials, { autoFetch: true });
  useUserStoreSync(utStore, 'PropertyConsents', setStConsents, { autoFetch: true });

  useEffect(() => {
    void utStore.get('PropertyConsents');
  }, [utStore]);

  const utInitialUsername = stCredentials ? stCredentials['username'] : '';
  const utName = 'Edit Username';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAlertClose();
    setStUsername(e.target.value);
    setStSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    handleAlertClose();
    setStLoading(true);
    e.preventDefault();

    if (!stUsername) {
      setStLoading(false);
      return;
    }

    if (stUsername === utInitialUsername) {
      handleAlertOpen('No changes detected', 'Username is unchanged.', 'i');
      setStLoading(false);
      return;
    }

    try {
      const utRes = (await utStore.post('ActionEditProfile', { username: stUsername }, true)) as
        | EditProfileResponse
        | false;

      if (utRes) {
        setStSuccess(true);
        handleAlertOpen('Success', 'Username changed successfully.', 's');
        utStore.update('PropertyCredentials', { username: stUsername });
      } else {
        const utMessage =
          (utStore.getError('ActionEditProfile') as string) || 'An unexpected error occurred.';
        handleAlertOpen('An error occurred', utMessage, 'f');
      }
    } finally {
      setStLoading(false);
    }
  };

  useEffect(() => {
    if (stCredentials?.username) {
      setStUsername(stCredentials.username);
    }
  }, [stCredentials]);

  const hasNewsletterConsent = Boolean(stConsents?.consents_newsletter);
  const newsletterHref = hasNewsletterConsent
    ? '/users/unsubscribe-newsletter'
    : '/users/subscribe-newsletter';
  const newsletterLabel = hasNewsletterConsent
    ? 'Unsubscribe from Newsletter'
    : 'Subscribe to Newsletter';

  return (
    <>
      {stCredentials && utInitialUsername ? (
        <>
          <h1 className="look-text-x4">{utName}</h1>
          <form onSubmit={handleSubmit} className="area-flex-col">
            <input
              type="text"
              value={stUsername}
              onChange={handleChange}
              placeholder={stSuccess ? stUsername : utInitialUsername}
              className="look-input-auth"
            />
            <button className="look-button-secondary mod-button-auth">Save</button>
          </form>
          <a href="/users/password-reset/token/request" className="look-button-subtle">
            Forgot Password?
          </a>
          <a href={newsletterHref} className="look-button-subtle">
            {newsletterLabel}
          </a>
          <a href="/users/logout" className="look-button-subtle">
            Logout
          </a>
        </>
      ) : (
        <COM_Loading />
      )}
    </>
  );
}

export default COM_FormEditProfile;
