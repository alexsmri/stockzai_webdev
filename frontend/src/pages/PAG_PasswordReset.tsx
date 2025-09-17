import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_FormPasswordReset from '../components/COM_FormPasswordReset';
import COM_Hero from '../components/COM_Hero';

function PAG_PasswordReset() {
  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormPasswordReset />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}

export default PAG_PasswordReset;
