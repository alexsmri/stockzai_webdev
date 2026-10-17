import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LOGO from '@/assets/media/LOGO_quadrat.svg';
import ICON_Hamburger from '@/assets/media/ICON_Hamburger.svg?react';
import ICON_Close from '@/assets/media/ICON_Close.svg?react';
import { useUserStore } from '../../context/CTX_UserStore';
import { useUserStoreSync } from '../../hooks/hooks';
import { LANDING_NAV_LINKS, LANDING_ROUTES } from './landingContent';

function COM_LandNavbar() {
  const utStore = useUserStore();
  const [stIsLoggedIn, setStIsLoggedIn] = useState<boolean>(Boolean(utStore.read('ActionLogin')));
  useUserStoreSync(utStore, 'ActionLogin', (value) => setStIsLoggedIn(Boolean(value)));
  // the menu is only collapsible on mobile; on desktop the CSS always shows it inline
  const [stMenuOpen, setStMenuOpen] = useState(false);

  useEffect(() => {
    if (!stMenuOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setStMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stMenuOpen]);

  const closeMenu = () => setStMenuOpen(false);

  return (
    <header className="lp-navbar">
      <Link to="/" aria-label="stockz.ai" onClick={closeMenu}>
        <img className="lp-navbar-logo" src={LOGO} alt="stockz.ai" />
      </Link>

      <button
        type="button"
        className="lp-navbar-toggle"
        aria-label={stMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={stMenuOpen}
        aria-controls="lp-navbar-menu"
        onClick={() => setStMenuOpen((open) => !open)}
      >
        {stMenuOpen ? <ICON_Close /> : <ICON_Hamburger />}
      </button>

      <div id="lp-navbar-menu" className={stMenuOpen ? 'lp-navbar-menu lp-navbar-menu-open' : 'lp-navbar-menu'}>
        <nav className="lp-navbar-links">
          {LANDING_NAV_LINKS.map(({ label, href }) =>
            href.includes('#') ? (
              <a key={href} href={href} onClick={closeMenu}>
                {label}
              </a>
            ) : (
              <Link key={href} to={href} onClick={closeMenu}>
                {label}
              </Link>
            )
          )}
        </nav>
        <div className="lp-navbar-actions">
          {stIsLoggedIn ? (
            <Link className="lp-button lp-button-light" to={LANDING_ROUTES.app}>
              Open App
            </Link>
          ) : (
            <>
              <Link className="lp-button lp-button-light" to={LANDING_ROUTES.register}>
                Sign Up
              </Link>
              <Link className="lp-button lp-button-ghost" to={LANDING_ROUTES.login}>
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default COM_LandNavbar;
