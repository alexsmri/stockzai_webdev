import Logo from '@/assets/media/LOGO_schwarzquer.svg?react';
import Hamburger from '@/assets/media/ICON_Hamburger.svg?react';
import HamburgerClose from '@/assets/media/ICON_HamburgerClose.svg?react';
import { useUserStore } from '../context/CTX_UserStore';
import { useStickyObserver, useUserStoreSync } from '../hooks/hooks';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindowDimensions } from '../hooks/hooks';
import { MOBILE_BREAKPOINT } from '../constants';

const MENU_CLASS_NAMES = {
  open: 'area-menu-mobile',
  closed: 'area-flex-row mod-gap-xl mod-padding-none mod-center',
};
export default function COM_Navbar() {
  const utStore = useUserStore();
  const [loggedIn, setLoggedIn] = useState(utStore.read('ActionLogin'));
  const [stIsOpen, setStIsOpen] = useState(false);
  const toggleMenu = () => setStIsOpen((prev) => !prev);

  const navRef = useRef<HTMLElement>(null);
  useStickyObserver(navRef, 'sentinel-nav');

  useUserStoreSync(utStore, 'PropertyCredentials', setLoggedIn);
  const { width } = useWindowDimensions();
  const navigate = useNavigate();

  const utLinkClasses =
    width <= MOBILE_BREAKPOINT ? 'look-button-ghost look-text-x3' : 'look-button-ghost';

  const utMenuLinks = (
    <>
      <a href="/companies/search" className={utLinkClasses}>
        Search
      </a>
      <a href="/companies/compare" className={utLinkClasses}>
        Compare
      </a>
      {loggedIn ? (
        <>
          <a href="/users/edit" className={utLinkClasses}>
            Profile
          </a>
        </>
      ) : (
        <>
          <a href="/users/login" className={utLinkClasses}>
            Log In{' '}
          </a>

          <a href="/users/register" className={utLinkClasses}>
            Sign Up{' '}
          </a>
        </>
      )}
    </>
  );

  const utMenuRight = (
    <>
      {width <= MOBILE_BREAKPOINT ? (
        <>
          {stIsOpen ? (
            <>{utMenuLinks}</>
          ) : (
            <Hamburger
              className="img-hamburger mod-cursor-pointer"
              onClick={() => {
                toggleMenu();
              }}
            />
          )}
        </>
      ) : (
        <>{utMenuLinks}</>
      )}
    </>
  );
  return (
    <div className="area-flex-row">
      <div id="sentinel-nav" style={{ height: '1px', marginTop: '1.5rem' }} />
      <nav className="area-navbar" ref={navRef}>
        <Logo
          className="img-logo mod-cursor-pointer"
          onClick={() => {
            navigate('/');
          }}
        />
        {stIsOpen ? (
          <>
            <div className={MENU_CLASS_NAMES.closed}>
              <HamburgerClose
                className="img-hamburger mod-cursor-pointer"
                onClick={() => {
                  toggleMenu();
                }}
              />
            </div>
            <div className={MENU_CLASS_NAMES.open}>
              <div className="area-flex-col look-div-container">{utMenuRight}</div>
            </div>
          </>
        ) : (
          <div className={MENU_CLASS_NAMES.closed}>{utMenuRight}</div>
        )}
      </nav>
    </div>
  );
}
