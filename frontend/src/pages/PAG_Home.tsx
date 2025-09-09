import COM_Navbar from '../components/COM_Navbar';
import COM_Footer from '../components/COM_Footer';
import COM_SectionHero from '../components/landingpage/COM_SectionHero';
import COM_SectionTrust from '../components/landingpage/COM_SectionTrust';
import { useState } from 'react';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

function PAG_Home() {
  const utStore = useUserStore();
  const [loggedIn, setLoggedIn] = useState(utStore.read('ActionLogin'));

  useUserStoreSync(utStore, 'PropertyCredentials', setLoggedIn);
  return (
    <>
      <COM_Navbar />
      <COM_SectionHero prLoggedIn={loggedIn} />
      <COM_SectionTrust prLoggedIn={loggedIn} />
      <COM_Footer />
    </>
  );
}

export default PAG_Home;
