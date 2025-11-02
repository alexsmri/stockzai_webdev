import { useEffect, useMemo, useState, type FunctionComponent, type SVGProps } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { scale } from '../utils/functions';
import ICON_User from '@/assets/media/ICON_User.svg?react';
import ICON_Crown from '@/assets/media/ICON_Crown.svg?react';

export type SidebarUsersTab = 'account' | 'plans';

interface SidebarUsersProps {
  activeTab: SidebarUsersTab;
  onSelect: (tab: SidebarUsersTab) => void;
}

type Credentials = Record<string, unknown> | null;

function readUsername(data: Credentials): string {
  if (!data || typeof data !== 'object') {
    return '';
  }
  if (typeof data.username === 'string' && data.username.length > 0) {
    return data.username;
  }
  if (typeof data.email === 'string' && data.email.length > 0) {
    return data.email.split('@')[0];
  }
  if (typeof data.first_name === 'string' && data.first_name.length > 0) {
    return data.first_name;
  }
  if (data.user && typeof data.user === 'object') {
    return readUsername(data.user as Credentials);
  }
  return '';
}

const NAV_ITEMS: {
  key: SidebarUsersTab;
  label: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}[] = [
  { key: 'account', label: 'Account', icon: ICON_User },
  { key: 'plans', label: 'Plans', icon: ICON_Crown },
];

export default function COM_SidebarUsers({ activeTab, onSelect }: SidebarUsersProps) {
  const userStore = useUserStore();
  const [stCredentials, setStCredentials] = useState<Credentials>(
    (userStore.read('PropertyCredentials') as Credentials) ?? null
  );

  useUserStoreSync(userStore, 'PropertyCredentials', setStCredentials);

  useEffect(() => {
    void userStore.get('PropertyCredentials');
  }, [userStore]);

  const displayName = useMemo(() => {
    const username = readUsername(stCredentials);
    return username || 'Profile';
  }, [stCredentials]);

  return (
    <aside
      className="area-sidebar-users area-flex-col mod-align-left"
      aria-label="User management navigation"
    >
      <div className="area-flex-row mod-align-center mod-padding-none">
        <div
          aria-hidden
          style={{
            width: scale(2.5),
            height: scale(2.5),
            borderRadius: '50%',
            backgroundColor: 'color-mix(in srgb, var(--color-secondary) 12%, transparent)',
            flexShrink: 0,
          }}
        />
        <span
          className="look-text-x1 mod-centerheight mod-text-wrap-gradient mod-align-left"
          style={{ flex: 1 }}
        >
          {displayName}
        </span>
      </div>
      <nav className="area-flex-col mod-align-left mod-padding-none" style={{ width: '100%' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={['look-button-ghost', 'mod-button-auth', isActive ? 'mod-selected' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(item.key)}
              aria-pressed={isActive}
            >
              <item.icon style={{ width: scale(1.2), height: scale(1.2) }} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
