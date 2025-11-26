import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import { useSearchParams } from 'react-router-dom';

export default function COM_FormPasswordResetRequest() {
  const [searchParams] = useSearchParams();
  const prefillEmail = useMemo(
    () => (searchParams.get('prefill_email') ?? '').trim(),
    [searchParams]
  );
  const [stEmail, setStEmail] = useState<string>('');

  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();

  useEffect(() => {
    if (prefillEmail) {
      setStEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stEmail) {
      handleAlertOpen('Missing email', 'Please enter your email address.', 'f');
    } else {
      const utRes = await utStore.post('TokenPasswordResetRequest', { email: stEmail });
      if (utRes) {
        handleAlertOpen(
          'Success',
          'We sent you a password reset email. Please check your inbox.',
          's'
        );
      } else {
        handleAlertOpen(
          'An error occurred',
          'We could not send the reset email. Please try again.',
          'f'
        );
      }
    }
  };

  return (
    <>
      <h1 className="look-text-x4">Reset Password</h1>
      <div className="area-flex-col look-div-subtle mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <input
            type="email"
            value={stEmail}
            onChange={(e) => setStEmail(e.target.value)}
            placeholder="Email"
            className="look-input-auth"
          />
          <button className="look-button-secondary mod-button-auth">Submit</button>
        </form>
      </div>
    </>
  );
}
