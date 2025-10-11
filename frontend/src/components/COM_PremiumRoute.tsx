import { useEffect, useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import ICON_ArrowLeft from '@/assets/media/ICON_ArrowLeft.svg?react';
import COM_Loading from './COM_Loading';
import COM_Paywall from './COM_Paywall';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

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
  const navigate = useNavigate();
  const [accessPayload, setAccessPayload] = useState<ITF_AccessConfig | null>(
    userStore.read('PropertyAccess') as ITF_AccessConfig | null
  );
  const [stLoading, setStLoading] = useState<boolean>(true);

  const handleBack = () => {
    navigate('/companies/search');
  };

  useUserStoreSync(userStore, 'PropertyAccess', setAccessPayload, { autoFetch: true });
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

  useEffect(() => {
    if (accessPayload !== null && typeof accessPayload === 'object') {
      hasAccess = hasOverlap('products') || hasOverlap('permissions') ? true : false;
      setStLoading(false);
    }
  }, [accessPayload]);

  if (stLoading) {
    return <COM_Loading />;
  }

  return (
    <>
      <button
        type="button"
        className="look-button-ghost area-flex-row mod-gap-s mod-align-left"
        style={{
          alignItems: 'center',
          display: 'inline-flex',
          marginBottom: '1.5rem',
          padding: '0.4rem 0.8rem',
        }}
        onClick={handleBack}
        aria-label="Go back to search"
      >
        <ICON_ArrowLeft style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
        <span>Back</span>
      </button>
      {children}
      <COM_Paywall prIsOpen={!hasAccess} />
    </>
  );
}
