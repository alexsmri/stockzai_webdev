import COM_FormLogin from '../components/COM_FormLogin';
import COM_FooterAuth from '../components/COM_FooterAuth';

function PAG_Login({ prRedirect = APP_HOME_PATH }: { prRedirect?: string }) {
  return (
    <>
      <COM_FormLogin prRedirect={prRedirect} />
      <COM_FooterAuth />
    </>
  );
}

import { APP_HOME_PATH } from '../constants';
export default PAG_Login;
