import Logo from '@/assets/media/LOGO_schwarzquer.svg?react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindowDimensions } from '../hooks/hooks';
import { MOBILE_BREAKPOINT } from '../constants';

const MENU_CLASS_NAMES = {
  open: 'area-menu-mobile',
  closed: 'area-flex-row mod-gap-xl',
};
export default function COM_Navbar() {
  const utStore = useUserStore();
  const [loggedIn, setLoggedIn] = useState(utStore.read('ActionLogin'));
  const [stIsOpen, setStIsOpen] = useState(false);
  const toggleMenu = () => setStIsOpen((prev) => !prev);

  useUserStoreSync(utStore, 'PropertyCredentials', setLoggedIn);
  const { width } = useWindowDimensions();
  const navigate = useNavigate();

  const utMenuLinks = (
    <>
      <a href="/companies/search/" className="look-button-ghost">
        Search
      </a>
      <a href="/companies/compare/" className="look-button-ghost">
        Compare
      </a>
      {loggedIn ? (
        <>
          <a href="/users/edit" className="look-button-ghost">
            Profile
          </a>
        </>
      ) : (
        <>
          <a href="/users/login/" className="look-button-ghost">
            Log In{' '}
          </a>

          <a href="/users/register/" className="look-button-ghost">
            Sign Up{' '}
          </a>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="area-flex-row mod-space-between">
        <Logo
          className="img-logo mod-cursor-pointer"
          onClick={() => {
            navigate('/');
          }}
        />
        <div className={stIsOpen ? MENU_CLASS_NAMES.open : MENU_CLASS_NAMES.closed}>
          {width <= MOBILE_BREAKPOINT ? (
            <>
              <button className="look-button-ghost" onClick={toggleMenu}>
                ☰
              </button>
              {stIsOpen && utMenuLinks}
            </>
          ) : (
            <>{utMenuLinks}</>
          )}
        </div>
      </nav>
    </>
  );
}
