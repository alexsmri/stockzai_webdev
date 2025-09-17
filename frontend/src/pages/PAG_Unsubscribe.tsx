import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_FormUnsubscribe from '../components/COM_FormUnsubscribe';
import COM_Hero from '../components/COM_Hero';

export default function PAG_Unsubscribe() {
  return (
    <>
      <COM_Hero>
        <COM_FormUnsubscribe />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
