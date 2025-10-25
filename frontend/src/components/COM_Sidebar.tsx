import { useEffect, useMemo, useState, type FunctionComponent, type SVGProps } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import LOGO_schwarzquer from '@/assets/media/LOGO_quadrat.svg?react';
import ICON_Expand from '@/assets/media/ICON_Expand.svg?react';
import ICON_Search from '@/assets/media/ICON_Search.svg?react';
import ICON_FirstPlace from '@/assets/media/ICON_FirstPlace.svg?react';
import ICON_Feedback from '@/assets/media/ICON_Feedback.svg?react';
import ICON_User from '@/assets/media/ICON_User.svg?react';
import { useWindowDimensions, useUserStoreSync } from '../hooks/hooks';
import { useUserStore } from '../context/CTX_UserStore';
import { MOBILE_BREAKPOINT } from '../constants';

type NavItem = {
  label: string;
  to: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  isActive?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Search',
    to: '/companies/search',
    Icon: ICON_Search,
    isActive: (pathname) =>
      pathname.startsWith('/companies/search') || pathname.startsWith('/companies/page'),
  },
  {
    label: 'Top Stocks',
    to: '/companies/top-stocks',
    Icon: ICON_FirstPlace,
    isActive: (pathname) => pathname.startsWith('/companies/top-stocks'),
  },
  {
    label: 'Feedback',
    to: '/feedback',
    Icon: ICON_Feedback,
    isActive: (pathname) => pathname.startsWith('/feedback'),
  },
];

const SIDEBAR_SELECTED_CLASS = 'mod-selected';
const MENU_LINK_PADDING = 'calc(var(--default-font-size) * 0.5) calc(var(--default-font-size) * 1)';
const LOGO_PADDING_EXPANDED =
  'calc(var(--default-font-size) * 0.5) calc(var(--default-font-size) * 1)';
const LOGO_PADDING = 'calc(var(--default-font-size) * 0.5) 0';

function readUsername(data: any | null): string {
  if (!data || typeof data !== 'object') {
    return '';
  }
  if (typeof data.username === 'string') {
    return data.username;
  }
  if (typeof data.email === 'string') {
    return data.email.split('@')[0];
  }
  if (typeof data.first_name === 'string') {
    return data.first_name;
  }
  if (data.user && typeof data.user === 'object') {
    return readUsername(data.user);
  }
  return '';
}

export default function COM_Sidebar() {
  const { width } = useWindowDimensions();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = width <= MOBILE_BREAKPOINT;
  const [stExpanded, setStExpanded] = useState<boolean>(!isMobile);
  const sidebarWidth = isMobile
    ? 'var(--sidebar-width-collapsed)'
    : 'var(--sidebar-width-expanded)';

  useEffect(() => {
    setStExpanded(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setStExpanded(false);
    }
  }, [location.pathname, isMobile]);

  const handleToggle = () => {
    if (isMobile) {
      setStExpanded((prev) => !prev);
    }
  };

  const showLabels = !isMobile || stExpanded;

  const sidebarClasses = useMemo(() => {
    const classes = ['area-sidebar', 'area-flex-col', 'mod-gap-l', 'mod-z-3'];
    if (isMobile && stExpanded) {
      classes.push('area-sidebar-mobile');
    }
    if (!showLabels) {
      classes.push('area-sidebar--collapsed');
    }
    return classes.join(' ');
  }, [isMobile, stExpanded, showLabels]);

  const userStore = useUserStore();
  const [stCredentials, setStCredentials] = useState<any | null>(
    userStore.read('PropertyCredentials')
  );
  useUserStoreSync(userStore, 'PropertyCredentials', setStCredentials);
  const [stLoginTokens, setStLoginTokens] = useState<any | null>(userStore.read('ActionLogin'));
  useUserStoreSync(userStore, 'ActionLogin', setStLoginTokens);
  const isAuthenticated = Boolean(
    (stLoginTokens && typeof stLoginTokens === 'object' && stLoginTokens?.access) ||
      (stCredentials && typeof stCredentials === 'object')
  );
  const username = readUsername(stCredentials);
  const displayName = username || 'Profile';

  const handleProfileNavigate = () => {
    userStore.set('StateEditing', true);
  };

  const handleSignUpNavigate = () => {
    navigate('/users/register');
    if (isMobile) {
      setStExpanded(false);
    }
  };

  const placeholder = (
    <div
      aria-hidden
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        flexShrink: 0,
      }}
    />
  );

  return (
    <>
      {placeholder}
      <aside className={sidebarClasses} aria-label="Primary navigation">
        <div
          className="area-flex-col mod-gap-s mod-padding-none"
          style={{ alignItems: showLabels ? 'stretch' : 'center', width: '100%' }}
        >
          {isMobile && (
            <button
              type="button"
              className="look-sidebar-toggle look-button-ghost mod-button-auth"
              onClick={handleToggle}
              aria-label={stExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={stExpanded}
              style={{ color: stExpanded ? 'var(--color-secondary-a60)' : undefined }}
            >
              <ICON_Expand
                style={{
                  width: 'calc(var(--default-font-size) * 1.1)',
                  height: 'calc(var(--default-font-size) * 1.1)',
                  transform: stExpanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s ease',
                }}
              />
            </button>
          )}
          <LOGO_schwarzquer
            style={{
              width: 'auto',
              height: 'calc(var(--default-font-size) * 2.8)',
              alignSelf: showLabels ? 'flex-start' : 'center',
              padding: showLabels ? LOGO_PADDING_EXPANDED : LOGO_PADDING,
            }}
          />
        </div>
        <nav className="area-flex-col mod-padding-none" style={{ width: '100%' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) => {
                const activeByConfig = item.isActive ? item.isActive(location.pathname) : isActive;
                return [
                  'area-flex-row',
                  'look-button-ghost',
                  'mod-button-auth',
                  activeByConfig ? SIDEBAR_SELECTED_CLASS : '',
                ]
                  .filter(Boolean)
                  .join(' ');
              }}
              style={{
                justifyContent: showLabels ? 'flex-start' : 'center',
                padding: MENU_LINK_PADDING,
                width: '100%',
              }}
              end={!item.isActive}
              onClick={() => {
                if (isMobile) {
                  setStExpanded(false);
                }
              }}
            >
              <item.Icon
                style={{
                  width: 'calc(var(--default-font-size) * 1.2)',
                  height: 'calc(var(--default-font-size) * 1.2)',
                }}
              />
              {showLabels && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        {isAuthenticated ? (
          <button
            type="button"
            className="area-flex-row mod-gap-s mod-align-left"
            onClick={handleProfileNavigate}
            aria-label="Edit profile"
            style={{
              width: '100%',
              marginTop: 'auto',
              justifyContent: showLabels ? 'flex-start' : 'center',
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 'calc(var(--default-font-size) * 2.5)',
                height: 'calc(var(--default-font-size) * 2.5)',
                borderRadius: '50%',
                backgroundColor: 'color-mix(in srgb, var(--color-secondary) 12%, transparent)',
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            {showLabels && (
              <div className="area-flex-col mod-gap-none mod-padding-none mod-align-left">
                <span
                  className="look-text-x1 look-text-normal look-text-clickable mod-padding-none"
                  style={{ justifyContent: 'initial' }}
                >
                  {displayName}
                </span>
                <span className="look-text-x0 look-text-subtle">Free Plan</span>
              </div>
            )}
          </button>
        ) : (
          <button
            type="button"
            className={['area-flex-row', 'look-button-ghost', 'mod-button-auth']
              .filter(Boolean)
              .join(' ')}
            style={{
              width: '100%',
              marginTop: 'auto',
              justifyContent: showLabels ? 'center' : 'center',
            }}
            onClick={handleSignUpNavigate}
            aria-label="Sign Up"
          >
            {showLabels ? (
              <span style={{ width: '100%', textAlign: 'center' }}>Sign Up</span>
            ) : (
              <ICON_User
                style={{
                  width: 'calc(var(--default-font-size) * 1.3)',
                  height: 'calc(var(--default-font-size) * 1.3)',
                }}
              />
            )}
          </button>
        )}
      </aside>
    </>
  );
}
