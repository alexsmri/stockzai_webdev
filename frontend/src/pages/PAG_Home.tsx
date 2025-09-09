import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';
import COM_Footer from '../components/COM_Footer';
import COM_Winners from '../components/COM_Winners';
import { PRV_WinnerStore } from '../context/CTX_WinnerStore';
import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

const PRIMARY_BUTTON_LINKS = {
  login: '/companies/search',
  anonymous: '/users/register',
};
function PAG_Home() {
  const utStore = useUserStore();
  const [loggedIn, setLoggedIn] = useState(utStore.read('ActionLogin'));

  useUserStoreSync(utStore, 'PropertyCredentials', setLoggedIn);
  const utLink = loggedIn ? PRIMARY_BUTTON_LINKS.login : PRIMARY_BUTTON_LINKS.anonymous;
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <div className="area-flex-col mod-gap-l look-div-backlight">
          <div className="area-flex-col mod-gap-l">
            <h1 className="look-text-x8 look-text-hero">Master the Market. Effortlessly.</h1>
            <h3 className="look-text-x2">All the info you need, none of the noise. 100% Free.</h3>
            <a href={utLink} className="look-button-primary">
              {loggedIn ? 'Search Tickers' : 'Create Account'}
            </a>
          </div>
          <PRV_WinnerStore args={[]}>
            <COM_Winners />
          </PRV_WinnerStore>
        </div>
        <div className="area-flex-row">
          <div className="area-flex-row look-div-container mod-gap-l">
            <p className="look-text-x4 look-text-hero">20.000+</p>
            <p className="look-text-subtle look-text-x1">companies</p>
          </div>
          <div className="area-flex-row look-div-container mod-gap-l">
            <p className="look-text-x4 look-text-hero">100+</p>
            <p className="look-text-subtle look-text-x1">KPIs / company</p>
          </div>
        </div>
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_Home;
