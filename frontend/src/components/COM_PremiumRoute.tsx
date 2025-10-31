import { useEffect, useState, type JSX } from 'react';
import COM_Loading from './COM_Loading';
import COM_Paywall from './COM_Paywall';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { PAYWALL_ENABLED } from '../constants';

interface ITF_AccessConfig {
  products?: string[];
  permissions?: string[];
}

interface PI_PremiumRoute {
  children: JSX.Element;
  prAccessConfig: ITF_AccessConfig;
}

export default function COM_PremiumRoute({ children, prAccessConfig }: PI_PremiumRoute) {
  const userStore = useUserStore();
  const [accessPayload, setAccessPayload] = useState<ITF_AccessConfig | null>(
    userStore.read('PropertyAccess') as ITF_AccessConfig | null
  );
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [stLoading, setStLoading] = useState<boolean>(true);
  const isPaywallActive = PAYWALL_ENABLED;

  useUserStoreSync(userStore, 'PropertyAccess', setAccessPayload, { autoFetch: true });

  const hasOverlap = (prCategory: 'permissions' | 'products') => {
    const required = prAccessConfig[prCategory] ?? [];
    const granted = accessPayload?.[prCategory] ?? [];

    if (!required.length || !granted.length) {
      return false;
    }

    return required.some((item) => granted.includes(item));
  };

  useEffect(() => {
    const requiresAccess = Boolean(
      prAccessConfig.products?.length || prAccessConfig.permissions?.length
    );

    if (!isPaywallActive || !requiresAccess) {
      setHasAccess(true);
      setStLoading(false);
      return;
    }

    const accessLoaded = accessPayload !== null && typeof accessPayload === 'object';

    if (!accessLoaded) {
      return;
    }

    setHasAccess(hasOverlap('products') || hasOverlap('permissions'));
    setStLoading(false);
  }, [accessPayload, prAccessConfig, isPaywallActive]);

  if (stLoading) {
    return <COM_Loading />;
  }

  if (!isPaywallActive) {
    return children;
  }

  return (
    <>
      {children}
      <COM_Paywall prIsOpen={!hasAccess} />
    </>
  );
}
