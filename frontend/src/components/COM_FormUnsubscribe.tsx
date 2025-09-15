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
  const [utSearchParams] = useSearchParams();
  const utNext = utSearchParams.get('next') || '/';
  const [stReason, setStReason] = useState<string | null>(null);
  const [stOtherChecked, setStOtherChecked] = useState(false);

  const navigate = useNavigate();

  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();

  useEffect(() => {
    (async () => {
      const utSubscribed = await utStore.get('PropertyConsents');
      console.log(utSubscribed);
      if (!utSubscribed?.consents_newsletter) {
        navigate('/users/subscribe-newsletter/');
      }
    })();
  }, []);

  const handleCheckboxChange = (other: boolean, reason?: string) => {
    if (other) {
      setStReason('');
      setStOtherChecked(!stOtherChecked);
    } else {
      setStReason(reason || '');
      setStOtherChecked(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStReason(e.target.value);
    setStOtherChecked(true);
  };

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
              onChange={() => handleCheckboxChange(false, reason)}
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
                value={stReason !== null && !DEFAULT_REASONS.includes(stReason) ? stReason : ''}
                placeholder="Other Reason"
                onChange={(e) => handleTextChange(e)}
                className="look-input-secondary"
              />
            </div>
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

  console.log(stReason);

  return (
    <>
      <h1 className="look-text-x7">Unsubscribe</h1>
      <p className="look-text-subtle">
        Why do you wish to unsubscribe from stockz.ai newsletter? Please provide a reason
      </p>
      <form onSubmit={handleSubmit} className="area-flex-col mod-gap-l">
        <div className="area-flex-col mod-align-left">
          {DEFAULT_REASONS.map((reason, idx) => {
            return formatReason(reason, idx === DEFAULT_REASONS.length - 1);
          })}
        </div>
        <button className="look-button-secondary">Confirm</button>
      </form>
    </>
  );
}
