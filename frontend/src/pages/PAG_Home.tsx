import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';
import COM_Footer from '../components/COM_Footer';
import COM_Winners from '../components/COM_Winners';
import { PRV_WinnerStore } from '../context/CTX_WinnerStore';
import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useNavigate } from 'react-router-dom';

const PRIMARY_BUTTON_LINKS = {
  login: '/companies/search',
  anonymous: '/users/register',
};
function PAG_Home() {
  const utStore = useUserStore();
  const [loggedIn, setLoggedIn] = useState(utStore.read('ActionLogin'));

  useUserStoreSync(utStore, 'PropertyCredentials', setLoggedIn);
  const navigate = useNavigate();
  const utLink = loggedIn ? PRIMARY_BUTTON_LINKS.login : PRIMARY_BUTTON_LINKS.anonymous;
  const utFeedbackLink = '/feedback';
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <div className="area-flex-col mod-gap-l">
          <div className="area-flex-col">
            <h1 className="look-text-x7">Master the Market. Effortlessly.</h1>
            <h3 className="look-text-x2">All the info you need, none of the noise. 100% Free.</h3>
            <button
              className="look-button-primary"
              onClick={() => {
                navigate(utLink);
              }}
            >
              {loggedIn ? 'Search Tickers' : 'Create Account'}
            </button>
          </div>
          <PRV_WinnerStore args={[]}>
            <COM_Winners />
          </PRV_WinnerStore>
        </div>
      </COM_Hero>
      <COM_Hero>
        <h1 className="look-text-x6">Your input matters.</h1>
        <p>
          With your feedback, you can help improve stockz.ai in its earliest days! Wouldn't that be
          great?
        </p>
        <button
          className="look-button-primary"
          onClick={() => {
            navigate(utFeedbackLink);
          }}
        >
          Give Feedback
        </button>
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_Home;
