import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';

export default function COM_FormPasswordResetRequest() {
  const [stEmail, setStEmail] = useState<string>('');

  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stEmail) {
      handleAlertOpen('Email not entered', 'f');
    } else {
      const utRes = await utStore.post('TokenPasswordResetRequest', { email: stEmail });
      if (utRes) {
        handleAlertOpen('An email has been sent to you to reset your password', 's');
      } else {
        handleAlertOpen('An error occured', 'f');
      }
    }
  };

  return (
    <>
      <h1 className="look-text-x7">Reset Password</h1>
      <form onSubmit={handleSubmit} className="area-flex-col">
        <input
          type="email"
          value={stEmail}
          onChange={(e) => setStEmail(e.target.value)}
          placeholder="Email"
          className="look-input-secondary"
        />
        <button className="look-button-primary">Submit</button>
      </form>
    </>
  );
}
