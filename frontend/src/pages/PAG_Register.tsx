import COM_FormRegister from '../components/COM_FormRegister';
import COM_Hero from '../components/COM_Hero';
import COM_FooterAuth from '../components/COM_FooterAuth';

function PAG_Register() {
  return (
    <>
      <COM_Hero prFlex={true}>
        <COM_FormRegister />
      </COM_Hero>
      <COM_FooterAuth />
    </>
  );
}

export default PAG_Register;
