import { useState, type JSX } from 'react';
import COM_Loading from './COM_Loading';
import COM_Paywall from './COM_Paywall';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

type TYP_AccessConfig = Record<'products' | 'permissions', string[] | null>;

interface ITF_AccessPayload {
  products?: string[];
  permissions?: string[];
}

interface PI_PremiumRoute {
  children: JSX.Element;
  prAccessConfig: TYP_AccessConfig;
}

export default function COM_PremiumRoute({ children, prAccessConfig }: PI_PremiumRoute) {
  const userStore = useUserStore();
  const [accessPayload, setAccessPayload] = useState<ITF_AccessPayload | null>(
    userStore.read('PropertyAccess') as ITF_AccessPayload | null
  );
  const [stLoading, setStLoading] = useState<boolean>(true);

  useUserStoreSync(userStore, 'PropertyAccess', setAccessPayload);

  let hasAccess = false;

  const hasOverlap = (prCategory: 'permissions' | 'products') => {
    if (accessPayload && prAccessConfig[prCategory] && accessPayload[prCategory]) {
      for (const value in prAccessConfig[prCategory]) {
        if (accessPayload[prCategory].includes(value)) {
          return true;
        }
      }
    }
    return false;
  };

  if (accessPayload && typeof accessPayload === 'object') {
    hasAccess = hasOverlap('products') || hasOverlap('permissions') ? true : false;
    setStLoading(false);
  }

  if (stLoading) {
    return <COM_Loading />;
  }

  return (
    <>
      {children}
      <COM_Paywall prIsOpen={!hasAccess} />
    </>
  );
}
