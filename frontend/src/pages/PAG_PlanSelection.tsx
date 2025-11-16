import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_Plans from '../components/COM_Plans';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { STRIPE_PLANS } from '../constants';
import type STO_Users from '../stores/STO_Users';

type StatusRecord = { completed_onboarding?: boolean } | null;

function useStatus() {
  const store = useUserStore();
  const [status, setStatus] = useState<StatusRecord>(store.read('PropertyStatus') as StatusRecord);
  useUserStoreSync(store, 'PropertyStatus', setStatus, { autoFetch: true });
  return { store, status };
}

function useCredentials(store: STO_Users) {
  const [credentials, setCredentials] = useState<Record<string, any> | null>(
    store.read('PropertyCredentials') as Record<string, any> | null
  );
  useUserStoreSync(store, 'PropertyCredentials', setCredentials, { autoFetch: true });
  return credentials;
}

export default function PAG_PlanSelection() {
  const { store, status } = useStatus();
  const credentials = useCredentials(store);
  const navigate = useNavigate();
  const hasCompletedOnboarding = Boolean(status?.completed_onboarding);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate('/companies/search', { replace: true });
    }
  }, [hasCompletedOnboarding, navigate]);

  const freeFeatures = useMemo(
    () => ['Free preview access', 'Limited KPIs', 'Perfect to explore the UI'],
    []
  );
  const proFeatures = useMemo(
    () => ['20.000+ companies', 'Sector Leaderboards', 'Access to all KPIs'],
    []
  );

  const handleSelectFree = useCallback(() => {
    navigate('/onboarding/choose-ticker');
  }, [navigate]);

  const handleSelectPro = useCallback(() => {
    const link = STRIPE_PLANS.pro.pro_monthly.link;
    if (!link) {
      return;
    }
    const email = credentials?.email;
    const href = email ? `${link}?locked_prefilled_email=${email}` : link;
    window.location.href = href;
  }, [credentials]);

  return (
    <>
      <div className="area-flex-col mod-gap-l mod-padding-xl mod-align-stretch mod-centerheight">
        <h1 className="look-text-x5 look-priority-low" style={{ textAlign: 'center' }}>
          Choose <span className="look-priority-high">your plan</span>
        </h1>
        <div
          className="area-flex-wrap mod-gap-xl mod-align-start"
          style={{ justifyContent: 'center' }}
        >
          <div
            className="look-div-solid area-flex-col mod-align-center"
            style={{ width: 'min(24rem, 100%)' }}
          >
            <COM_Plans
              prTitle="Free"
              prSubtitle="Explore the platform"
              prPriceValue="$0"
              prPriceSuffix="/month"
              prFeatures={freeFeatures}
              prButtonLabel="Start free"
              prButtonVariant="tertiary"
              prOnAction={handleSelectFree}
            />
          </div>
          <div
            className="look-div-solid look-ui-gradient area-flex-col mod-align-center"
            style={{ width: 'min(24rem, 100%)' }}
          >
            <COM_Plans
              prTitle="Pro"
              prSubtitle="Unlock everything for just"
              prPriceValue="$10"
              prPriceSuffix="/month"
              prFeatures={proFeatures}
              prButtonLabel="Go Pro"
              prButtonVariant="primary"
              prOnAction={handleSelectPro}
            />
          </div>
        </div>
      </div>
      <COM_FooterAuth />
    </>
  );
}
