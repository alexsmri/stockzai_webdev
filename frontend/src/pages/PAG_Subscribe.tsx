import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_FormSubscribe from '../components/COM_FormSubscribe';
import COM_Hero from '../components/COM_Hero';

export default function PAG_Subscribe() {
  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormSubscribe />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}
