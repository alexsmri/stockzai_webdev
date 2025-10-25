import { initializePaddle, type CheckoutOpenLineItem, type Paddle } from '@paddle/paddle-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

const PADDLE_ENVIRONMENT = (import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox').toLowerCase();
const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
const DEFAULT_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID || '';
const DEFAULT_SUCCESS_URL = import.meta.env.VITE_PADDLE_SUCCESS_URL || '';

interface CheckoutProps {
  items?: CheckoutOpenLineItem[];
  buttonLabel?: string;
  busyLabel?: string;
  className?: string;
  disabled?: boolean;
  customData?: Record<string, unknown>;
  successUrl?: string;
  theme?: 'light' | 'dark';
  displayMode?: 'inline' | 'overlay';
}

export default function COM_Checkout({
  items,
  buttonLabel = 'Complete purchase',
  busyLabel = 'Preparing checkout...',
  className,
  disabled = false,
  customData,
  successUrl,
  theme,
  displayMode = 'overlay',
}: CheckoutProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [initializing, setInitializing] = useState<boolean>(Boolean(PADDLE_CLIENT_TOKEN));
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const userStore = useUserStore();
  const [credentials, setCredentials] = useState<Record<string, unknown> | null>(
    (userStore.read('PropertyCredentials') as Record<string, unknown> | null) ?? null
  );

  useUserStoreSync(userStore, 'PropertyCredentials', setCredentials, { autoFetch: true });

  const email = typeof credentials?.email === 'string' ? credentials.email : '';

  const emailFieldId = useMemo(
    () => `checkout-email-${Math.random().toString(36).slice(2, 10)}`,
    []
  );

  const checkoutItems = useMemo<CheckoutOpenLineItem[]>(() => {
    if (items && items.length > 0) {
      return items;
    }
    if (DEFAULT_PRICE_ID) {
      return [{ priceId: DEFAULT_PRICE_ID, quantity: 1 }];
    }
    return [];
  }, [items]);

  const resolvedSuccessUrl = successUrl || DEFAULT_SUCCESS_URL || undefined;

  useEffect(() => {
    let isCancelled = false;
    if (!PADDLE_CLIENT_TOKEN) {
      setInitializationError('Paddle client token is not configured.');
      setInitializing(false);
      return;
    }

    initializePaddle({
      environment: PADDLE_ENVIRONMENT,
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: (data) => {
        if (import.meta.env.DEV) {
          console.debug('Paddle event:', data);
        }
      },
    })
      .then((paddleInstance) => {
        if (isCancelled) {
          return;
        }
        if (!paddleInstance) {
          setInitializationError('Failed to load Paddle checkout.');
          setPaddle(null);
          return;
        }
        setPaddle(paddleInstance);
        setInitializationError(null);
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Unexpected error initialising Paddle checkout.';
        setInitializationError(message);
        setPaddle(null);
      })
      .finally(() => {
        if (!isCancelled) {
          setInitializing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const canCheckout =
    paddle && !initializing && !initializationError && email && checkoutItems.length > 0;

  const handleCheckout = useCallback(() => {
    if (!paddle) {
      setCheckoutError('Checkout is not ready yet.');
      return;
    }
    if (!email) {
      setCheckoutError('Your account email could not be resolved.');
      return;
    }
    if (checkoutItems.length === 0) {
      setCheckoutError('No Paddle prices configured.');
      return;
    }

    setCheckoutError(null);
    setIsOpening(true);

    try {
      const settings = {
        displayMode,
        allowLogout: false,
        ...(resolvedSuccessUrl ? { successUrl: resolvedSuccessUrl } : {}),
        ...(theme ? { theme } : {}),
      } as Parameters<Paddle['Checkout']['open']>[0]['settings'];

      paddle.Checkout.open({
        items: checkoutItems,
        customer: { email },
        customData,
        settings,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to open Paddle checkout.';
      setCheckoutError(message);
    } finally {
      setIsOpening(false);
    }
  }, [checkoutItems, customData, displayMode, email, paddle, resolvedSuccessUrl, theme]);

  return (
    <div className={['com-checkout area-flex-col mod-gap-s', className].filter(Boolean).join(' ')}>
      <label className="look-text-x0 look-text-subtle" htmlFor={emailFieldId}>
        Account email
      </label>
      <input
        id={emailFieldId}
        className="look-input-auth"
        type="email"
        value={email}
        readOnly
        disabled
        aria-disabled="true"
        aria-describedby={`${emailFieldId}-help`}
      />
      <p id={`${emailFieldId}-help`} className="look-text-subtle look-text-x0">
        Checkout uses your account email and it cannot be changed.
      </p>

      {initializationError && (
        <p className="look-text-error look-text-x0" role="alert">
          {initializationError}
        </p>
      )}

      {checkoutError && !initializationError && (
        <p className="look-text-error look-text-x0" role="alert">
          {checkoutError}
        </p>
      )}
      <button
        type="button"
        className="look-button-auth"
        onClick={handleCheckout}
        disabled={disabled || isOpening || !canCheckout}
      >
        {isOpening || initializing ? busyLabel : buttonLabel}
      </button>
    </div>
  );
}
