import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/CTX_Alert';
import { useUserStore } from '../context/CTX_UserStore';

interface ITF_FormSocialCompleteProps {
  prEmail: string;
  prSessionToken: string;
  prPrefillUsername?: string;
  prRedirect?: string;
}

const CONTINUE_LABEL = 'Complete Account';

export default function COM_FormSocialComplete({
  prEmail,
  prSessionToken,
  prPrefillUsername = '',
  prRedirect = '/',
}: ITF_FormSocialCompleteProps) {
  const [stUsername, setStUsername] = useState(prPrefillUsername);
  const [stConsentsNewsletter, setStConsentsNewsletter] = useState(false);
  const [stConsentsTos, setStConsentsTos] = useState(false);
  const [stConsentsInformationOnly, setStConsentsInformationOnly] = useState(false);
  const [stLoading, setStLoading] = useState(false);

  const utStore = useUserStore();
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    setStUsername(prPrefillUsername);
  }, [prPrefillUsername]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const username = stUsername.trim();

    if (!username) {
      handleAlertOpen('Missing username', 'Please choose a username to continue.', 'f');
      return;
    }
    if (!stConsentsTos || !stConsentsInformationOnly) {
      handleAlertOpen(
        'Action required',
        'Please accept our privacy policy, terms and informational disclaimer to continue.',
        'f'
      );
      return;
    }

    setStLoading(true);
    try {
      const utRes = (await utStore.post('ActionSocialComplete', {
        session_token: prSessionToken,
        username,
        consents: {
          consents_newsletter: stConsentsNewsletter,
          consents_tos: stConsentsTos,
          consents_information_only: stConsentsInformationOnly,
        },
        newsletter: stConsentsNewsletter,
      })) as null | Record<string, any>;

      if (!utRes) {
        const utError =
          (utStore.getError('ActionSocialComplete') as string) ||
          'Could not complete your account. Please try again.';
        handleAlertOpen('An error occurred', utError, 'f', { timeout: 5000 });
        return;
      }

      if (utRes.access && utRes.refresh) {
        utStore.set('ActionLogin', { access: utRes.access, refresh: utRes.refresh });
      }
      await utStore.get('PropertyCredentials');
      const status = (await utStore.get('PropertyStatus')) as
        | { completed_onboarding?: boolean }
        | null;
      const target = status?.completed_onboarding ? prRedirect : '/onboarding/choose-ticker';
      handleAlertOpen('Welcome', `Welcome to stockz.ai, ${username}!`, 's');
      navigate(target);
    } finally {
      setStLoading(false);
    }
  };

  return (
    <div className="area-auth">
      <h1 className="look-text-x4">Finish setting up</h1>
      <p className="look-text-x1 look-priority-low mod-align-center">
        Choose a username and accept the required terms to continue with {prEmail}.
      </p>
      <div className="area-flex-col look-div-subtle mod-align-stretch mod-padding-xl">
        <form onSubmit={handleSubmit} className="look-form-auth">
          <input
            type="text"
            value={stUsername}
            onChange={(e) => setStUsername(e.target.value)}
            placeholder="Username"
            className="look-input-auth"
          />
          <label
            className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none"
            style={{ maxWidth: '20rem' }}
          >
            <input
              type="checkbox"
              checked={stConsentsTos}
              onChange={(e) => setStConsentsTos(e.target.checked)}
            />
            <span>
              I accept the privacy policy and{' '}
              <a
                href="https://stockz.ai/terms-conditions"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.preventDefault()}
              >
                Terms of Service
              </a>
              .
            </span>
          </label>
          <label
            className="area-flex-row look-text-subtle look-text-x0 mod-gap-s mod-padding-none"
            style={{ maxWidth: '20rem' }}
          >
            <input
              type="checkbox"
              checked={stConsentsInformationOnly}
              onChange={(e) => setStConsentsInformationOnly(e.target.checked)}
            />
            I confirm that I understand Stockz.ai provides informational scores only and no
            investment advice.
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
            Get stockz.ai newsletter for product updates and special offers (can be canceled at any
            time)
          </label>
          <button
            className="look-button-secondary mod-button-auth"
            disabled={stLoading || !stConsentsTos || !stConsentsInformationOnly}
          >
            {stLoading ? 'Completing...' : CONTINUE_LABEL}
          </button>
        </form>
      </div>
    </div>
  );
}
