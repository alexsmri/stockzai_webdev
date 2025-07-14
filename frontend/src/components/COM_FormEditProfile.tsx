import { useState, useEffect } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useAlert } from '../context/CTX_Alert';
import COM_Loading from './COM_Loading';

function COM_FormEditProfile() {
  const utStore = useUserStore();

  const [stCredentials, setStCredentials] = useState<Record<string, any>>(async () => {
    return await utStore.get('PropertyCredentials');
  });
  const [, setStLoading] = useState(false);
  const [stSuccess, setStSuccess] = useState(false);
  const [stUsername, setStUsername] = useState<string>('');

  const { handleAlertOpen, handleAlertClose } = useAlert();
  useUserStoreSync(utStore, 'PropertyCredentials', setStCredentials);
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
    if (stUsername) {
      if (stUsername === utInitialUsername) {
        const utMessage = 'Username is unchanged.';
        handleAlertOpen(utMessage, 'i');
        return;
      }

      const utRes = await utStore.post('ActionEditProfile', {
        username: stUsername,
      });
      setStSuccess(utRes);
      if (utRes) {
        const utMessage = 'Username changed successfully.';
        handleAlertOpen(utMessage, 's');
        utStore.update('PropertyCredentials', { username: stUsername });
      } else {
        const utMessage = (utStore.getError('ActionEditProfile') as string) || 'An error occured.';
        handleAlertOpen(utMessage, 'f');
      }
      setStLoading(false);
    }
  };

  useEffect(() => {
    if (stCredentials?.username) {
      setStUsername(stCredentials.username);
    }
  }, [stCredentials]);

  return (
    <>
      {stCredentials && utInitialUsername ? (
        <>
          <h1 className="look-text-x7">{utName}</h1>
          <form onSubmit={handleSubmit} className="area-flex-col">
            <input
              type="text"
              value={stUsername}
              onChange={(e) => handleChange(e)}
              placeholder={stSuccess ? stUsername : utInitialUsername}
              className="look-input-secondary"
            />
            <button className="look-button-primary">Save</button>
          </form>
          <a href="/users/password-reset/token/request" className="look-button-subtle">
            Forgot Password?
          </a>
          <a href="/users/logout/" className="look-button-subtle">
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
