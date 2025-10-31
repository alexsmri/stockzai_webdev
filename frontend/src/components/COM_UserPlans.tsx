import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import COM_Plans from './COM_Plans';
import COM_SubscriptionComingSoon from './COM_SubscriptionComingSoon';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useAlert } from '../context/CTX_Alert';
import COM_Loading from './COM_Loading';
import { PAYWALL_ENABLED } from '../constants';

type SubscriptionSummary = {
  product: string;
  expires_at?: string | null;
  cancel_at_period_end?: boolean;
  provider: string;
  provider_subscription_id: string;
};

function normalizeSubscriptions(value: unknown): SubscriptionSummary[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is SubscriptionSummary =>
      typeof item === 'object' &&
      item !== null &&
      'product' in item &&
      typeof (item as Record<string, unknown>).product === 'string'
  );
}

function formatDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function COM_UserPlans() {
  if (!PAYWALL_ENABLED) {
    return <COM_SubscriptionComingSoon />;
  }

  const userStore = useUserStore();
  const { handleAlertOpen } = useAlert();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<SubscriptionSummary[]>(
    normalizeSubscriptions(userStore.read('PropertySubscriptions'))
  );
  const [isActionLoading, setIsActionLoading] = useState(false);

  useUserStoreSync(
    userStore,
    'PropertySubscriptions',
    (s) => {
      setSubscriptions(normalizeSubscriptions(s));
    },
    { autoFetch: true }
  );

  if (!subscriptions) {
    return <COM_Loading />;
  }
  const activeSubscription = useMemo(() => subscriptions.at(0) ?? null, [subscriptions]);
  const hasActiveSubscription = Boolean(activeSubscription);
  const isCancellationScheduled = Boolean(activeSubscription?.cancel_at_period_end);
  const buttonLabel = !hasActiveSubscription
    ? 'Get Pro'
    : isCancellationScheduled
    ? 'Resume'
    : 'Cancel';
  const showGradient = !hasActiveSubscription || isCancellationScheduled;

  const renderFooter = useMemo(() => {
    if (!activeSubscription) {
      return (
        <p className="look-text-x0 look-text-subtle" style={{ maxWidth: '28ch' }}>
          Upgrade to Pro to unlock company leaderboards, all KPIs, and more exclusive data.
        </p>
      );
    }
    const expiresPrefix = isCancellationScheduled ? 'Valid until' : 'Renews on';
    const expiresAt = formatDate(activeSubscription.expires_at);
    return (
      <div className="area-flex-col mod-gap-s mod-padding-none">
        {isCancellationScheduled ? (
          <span className="look-text-x0 look-text-subtle">
            Cancellation scheduled - resume to keep your access.
          </span>
        ) : null}
        {expiresAt ? (
          <span className="look-text-x0 look-text-subtle">
            {expiresPrefix} <strong className="look-text-normal">{expiresAt}</strong>
          </span>
        ) : null}
      </div>
    );
  }, [activeSubscription, isCancellationScheduled]);

  const refreshSubscriptionData = useCallback(async () => {
    await userStore.get('PropertySubscriptions');
    await userStore.get('PropertyAccess');
  }, [userStore]);

  const handleAction = useCallback(async () => {
    if (!hasActiveSubscription) {
      navigate('/users/payment/checkout');
      return;
    }

    if (!activeSubscription) {
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = { plan_name: activeSubscription.product };
      if (isCancellationScheduled) {
        const result = await userStore.post('ActionResumeSubscription', payload, true);
        if (!result) {
          const errorMessage =
            (userStore.getError('ActionResumeSubscription') as string) ??
            'Failed to resume subscription.';
          handleAlertOpen('An error occurred', errorMessage, 'f');
        } else {
          handleAlertOpen('Success', 'Subscription resumed successfully.', 's');
          await refreshSubscriptionData();
        }
      } else {
        const result = await userStore.post('ActionCancelSubscription', payload, true);
        if (!result) {
          const errorMessage =
            (userStore.getError('ActionCancelSubscription') as string) ??
            'Failed to schedule cancellation.';
          handleAlertOpen('An error occurred', errorMessage, 'f');
        } else {
          handleAlertOpen(
            'Cancellation scheduled',
            'Cancellation scheduled at period end.',
            'i'
          );
          await refreshSubscriptionData();
        }
      }
    } finally {
      setIsActionLoading(false);
    }
  }, [
    activeSubscription,
    hasActiveSubscription,
    handleAlertOpen,
    isCancellationScheduled,
    navigate,
    refreshSubscriptionData,
    userStore,
  ]);

  return (
    <div className="area-flex-col mod-align-left">
      <div
        className={[
          'look-div-solid',
          'area-flex-col',
          'mod-align-center',
          showGradient ? 'look-ui-gradient' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: 'clamp(32rem, 90%)',
        }}
      >
        <COM_Plans
          prButtonLabel={buttonLabel}
          prOnAction={handleAction}
          prIsLoading={isActionLoading}
          prFooter={renderFooter}
        />
      </div>
    </div>
  );
}
