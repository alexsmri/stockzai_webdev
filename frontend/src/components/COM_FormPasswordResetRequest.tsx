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
      handleAlertOpen('Email not entered', 'Please enter your Email to continue', 'f');
    } else {
      const utRes = await utStore.post('TokenPasswordResetRequest', { email: stEmail });
      if (utRes) {
        handleAlertOpen('Email sent', 'Check your inbox for a link to reset your password', 's');
      } else {
        handleAlertOpen('An error occured', 'Please try again.', 'f');
      }
    }
  };

  return (
    <>
      <h1 className="look-text-x4">Reset Password</h1>
      <div className="area-flex-col look-div-container mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <input
            type="email"
            value={stEmail}
            onChange={(e) => setStEmail(e.target.value)}
            placeholder="Email"
            className="look-input-secondary"
          />
          <button className="look-button-auth">Submit</button>
        </form>
      </div>
    </>
  );
}
