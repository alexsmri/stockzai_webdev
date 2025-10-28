import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ICON_Close from '@/assets/media/ICON_Close.svg?react';
import COM_SidebarUsers, { type SidebarUsersTab } from '../components/COM_SidebarUsers';
import COM_FormEditUser from '../components/COM_FormEditUser';
import COM_UserPlans from '../components/COM_UserPlans';
import COM_Lightbox from '../components/COM_Lightbox';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { scale } from '../utils/functions';

const TAB_PARAM_KEY = 'view';

function isValidTab(value: string | null): value is SidebarUsersTab {
  return value === 'account' || value === 'plans';
}

export default function STR_UserManagement() {
  const store = useUserStore();
  const [stOpen, setStOpen] = useState<boolean>(Boolean(store.read('StateEditing')));
  useUserStoreSync(store, 'StateEditing', (value) => setStOpen(Boolean(value)));

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = useMemo<SidebarUsersTab>(() => {
    const param = searchParams.get(TAB_PARAM_KEY);
    return isValidTab(param) ? param : 'account';
  }, [searchParams]);
  const [activeTab, setActiveTab] = useState<SidebarUsersTab>(initialTab);

  useEffect(() => {
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  const handleClose = useCallback(() => {
    store.set('StateEditing', false);
  }, [store]);

  const handleSelect = useCallback(
    (tab: SidebarUsersTab) => {
      setActiveTab(tab);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(TAB_PARAM_KEY, tab);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (!stOpen) {
      return undefined;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose, stOpen]);

  useEffect(() => {
    if (!stOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [stOpen]);

  const renderContent = activeTab === 'account' ? <COM_FormEditUser /> : <COM_UserPlans />;
  // height still looks shit sometimes (changes when menu changes)
  return (
    <COM_Lightbox isOpen={stOpen} onClose={() => {}}>
      <div
        className="look-div-subtle mod-padding-none mod-center"
        style={{
          position: 'relative',
          backgroundColor: 'var(--color-primary)',
          width: 'min(72rem, 100%)',
          height: `clamp(${scale(30)}, 80%, 80%)`,
        }}
      >
        <div
          className="area-flex-col look-div-subtle"
          style={{
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close user management"
            className="look-button-ghost mod-button-auth"
            style={{
              position: 'absolute',
              top: scale(0.5),
              right: scale(0.5),
              zIndex: 2,
              background: 'rgba(15, 23, 42, 0.05)',
              borderRadius: '50%',
              width: scale(2.5),
              height: scale(2.5),
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ICON_Close
              style={{
                width: scale(1.2),
                height: scale(1.2),
              }}
            />
          </button>
          <div className="area-flex-row" style={{ width: '100%', minHeight: '24rem' }}>
            <COM_SidebarUsers activeTab={activeTab} onSelect={handleSelect} />
            <div
              className="area-flex-col mod-padding-xl mod-gap-xl"
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingTop: scale(3),
              }}
            >
              {renderContent}
            </div>
          </div>
        </div>
      </div>
    </COM_Lightbox>
  );
}
