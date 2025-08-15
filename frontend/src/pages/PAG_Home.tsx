import COM_Navbar from '../components/COM_Navbar';
import COM_Hero from '../components/COM_Hero';
import COM_Footer from '../components/COM_Footer';
import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';
import { useNavigate } from 'react-router-dom';

const PRIMARY_BUTTON_LINKS = {
  login: '/users/edit',
  anonymous: '/users/register',
};
function PAG_Home() {
  const utStore = useUserStore();
  const [loggedIn, setLoggedIn] = useState(utStore.read('ActionLogin'));

  useUserStoreSync(utStore, 'PropertyCredentials', setLoggedIn);
  const navigate = useNavigate();
  const utLink = loggedIn ? PRIMARY_BUTTON_LINKS.login : PRIMARY_BUTTON_LINKS.anonymous;
  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <div className="area-flex-col">
          <h1 className="look-text-x7">Only the bold become pioneers</h1>
          <p className="mod-align-center">
            Lock in your Pre-Beta access today. Get the perks others will miss.
          </p>
          <button
            className="look-button-primary"
            onClick={() => {
              navigate(utLink);
            }}
          >
            {loggedIn ? 'Edit Profile' : 'Claim your spot'}
          </button>
        </div>
      </COM_Hero>
      <COM_Footer />
    </>
  );
}

export default PAG_Home;
