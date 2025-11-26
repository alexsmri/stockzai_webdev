import { useEffect, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useAlert } from '../context/CTX_Alert';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DEFAULT_REASONS = [
  'I signed up by mistake',
  'Lack of value',
  'Too many E-Mails',
  'Other (enter below)',
];

export default function COM_FormUnsubscribe() {
  const [searchParams] = useSearchParams();
  const utNext = searchParams.get('next') || '/';
  const [stReason, setStReason] = useState<string>('');
  const [stOtherChecked, setStOtherChecked] = useState(false);

  const navigate = useNavigate();

  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();

  useEffect(() => {
    (async () => {
      const utSubscribed = (await utStore.get('PropertyConsents')) as Record<string, any>;
      if (!utSubscribed?.consents_newsletter) {
        navigate('/users/subscribe-newsletter', { replace: true });
      }
    })();
  }, [navigate, utStore]);

  const handleCheckboxChange = (isOther: boolean, reason?: string) => {
    if (isOther) {
      const nextChecked = !stOtherChecked;
      setStOtherChecked(nextChecked);
      setStReason(nextChecked ? '' : '');
    } else {
      setStOtherChecked(false);
      setStReason(reason ?? '');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStReason(e.target.value);
    if (!stOtherChecked) {
      setStOtherChecked(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stReason.trim()) {
      handleAlertOpen('Missing reason', 'Please let us know why you are unsubscribing.', 'f');
      return;
    }

    const utRes = await utStore.post('ActionUnsubscribeNewsletter', { reason: stReason.trim() });
    if (utRes) {
      await utStore.get('PropertyConsents');
      handleAlertOpen('Success', 'Newsletter subscription canceled.', 's');
      navigate(utNext);
    } else {
      handleAlertOpen('An error occurred', 'Please try again.', 'f');
    }
  };

  const formatReason = (reason: string, isLast: boolean) => {
    if (!isLast) {
      return (
        <label
          key={reason}
          className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none mod-flex-grow-children"
        >
          <input
            type="checkbox"
            checked={!stOtherChecked && stReason === reason}
            onChange={() => handleCheckboxChange(false, reason)}
          />
          {reason}
        </label>
      );
    }

    return (
      <label
        key={reason}
        className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none mod-flex-grow-children"
      >
        <div className="area-flex-col mod-align-left mod-padding-none">
          <div className="area-flex-row mod-padding-none mod-gap-s">
            <input
              type="checkbox"
              checked={stOtherChecked}
              onChange={() => handleCheckboxChange(true)}
            />
            {reason}
          </div>
          <input
            type="text"
            value={stOtherChecked ? stReason : ''}
            placeholder="Other Reason"
            onChange={handleTextChange}
            className="look-input-auth"
            disabled={!stOtherChecked}
          />
        </div>
      </label>
    );
  };

  return (
    <>
      <h1 className="look-text-x4">Unsubscribe</h1>
      <div className="area-flex-col look-div-subtle mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <p className="look-text-subtle">
            Why do you wish to unsubscribe from stockz.ai newsletter? Please provide a reason
          </p>
          <div className="look-form-auth">
            {DEFAULT_REASONS.map((reason, idx) =>
              formatReason(reason, idx === DEFAULT_REASONS.length - 1)
            )}
          </div>
          <button className="look-button-secondary mod-button-auth">Confirm</button>
        </form>
      </div>
    </>
  );
}
