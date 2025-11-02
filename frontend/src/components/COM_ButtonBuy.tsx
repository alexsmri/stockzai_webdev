import { useUserStore } from '../context/CTX_UserStore';
import { useState } from 'react';
import { useUserStoreSync } from '../hooks/hooks';

const environment_raw = import.meta.env.VITE_STRIPE_ENVIRONMENT;

const ENVIRONMENT = environment_raw === 'production' ? 'production' : 'dev';

export const STRIPE_PLANS = {
  pro_monthly: {
    link: ENVIRONMENT === 'dev' ? 'https://buy.stripe.com/test_cNifZgez4bHna5zaCZgbm00' : '',
    priceId: ENVIRONMENT === 'dev' ? 'price_1SOyiaBnrUSa2i9JrzxSZxzB' : '',
    price: 10,
    interval: '/month',
  },
  pro_yearly: {
    link: ENVIRONMENT === 'dev' ? 'https://buy.stripe.com/test_cNifZgez4bHna5zaCZgbm00' : '',
    priceId: ENVIRONMENT === 'dev' ? 'price_1SOyiaBnrUSa2i9JrzxSZxzB' : '',
    price: 10,
    interval: '/month',
  },
};

type TYP_BuyKey = keyof typeof STRIPE_PLANS;

export function COM_ButtonBuy({
  prPlanKey,
  prButtonLabel = 'Unlock Pro',
}: {
  prPlanKey: TYP_BuyKey;
  prButtonLabel?: string;
}) {
  const store = useUserStore();
  const [stCredentials, setStCredentials] = useState<Record<string, any> | null>(
    store.read('PropertyCredentials') as Record<string, any>
  );
  useUserStoreSync(store, 'PropertyCredentials', setStCredentials);

  const email = stCredentials?.email;
  const handleClick = () => {
    window.location.href = `${STRIPE_PLANS[prPlanKey].link}?prefilled_email=${email}`;
  };
  return (
    <a className="look-button-primary" onClick={handleClick}>
      {' '}
      {prButtonLabel}
    </a>
  );
}
