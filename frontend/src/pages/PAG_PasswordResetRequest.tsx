import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_FormPasswordResetRequest from '../components/COM_FormPasswordResetRequest';
import COM_Hero from '../components/COM_Hero';

export default function PAG_PasswordResetRequest() {
  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormPasswordResetRequest />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
