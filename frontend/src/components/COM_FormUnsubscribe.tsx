import { useState } from 'react';
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
  const [utSearchParams] = useSearchParams();
  const utNext = utSearchParams.get('next') || '/';
  const [stReason, setStReason] = useState<string>('');

  const navigate = useNavigate();

  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();

  const formatReason = (reason: string, isLast: boolean) => {
    let utOut = null;
    if (!isLast) {
      utOut = (
        <>
          <label
            className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none"
            style={{ maxWidth: '15rem' }}
          >
            <input
              type="checkbox"
              checked={stReason === reason}
              onChange={() => setStReason(reason)}
            />
            {reason}
          </label>
        </>
      );
    } else {
      utOut = (
        <>
          <label
            className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none"
            style={{ maxWidth: '15rem' }}
          >
            <input type="checkbox" checked={stReason === reason} onChange={() => setStReason('')} />
            <input
              type="text"
              value={stReason}
              placeholder="Other Reason"
              onChange={(e) => setStReason(e.target.value)}
              className="look-input-secondary"
            />
            {reason}
          </label>
        </>
      );
    }
    return utOut;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stReason) {
      handleAlertOpen('Email not entered', 'f');
    } else {
      const utRes = await utStore.get('ActionUnsubscribeNewsletter');
      if (utRes) {
        navigate(utNext);
        handleAlertOpen('Newsletter subscription canceled.', 's');
      } else {
        handleAlertOpen('An error occured. Please try again.', 'f');
      }
    }
  };

  return (
    <>
      <h1 className="look-text-x7">Unsubscribe</h1>
      <form onSubmit={handleSubmit} className="area-flex-col">
        {DEFAULT_REASONS.map((reason, idx) => {
          return formatReason(reason, idx === DEFAULT_REASONS.length - 1);
        })}
        <button className="look-button-secondary">Confirm</button>
      </form>
    </>
  );
}
