import COM_FormRegister from '../components/COM_FormRegister';
import COM_FooterAuth from '../components/COM_FooterAuth';
import COM_AuthShowcase from '../components/COM_AuthShowcase';
import IMG_ApplicationDemo from '../assets/media/IMG_ApplicationDemo.webp';

function PAG_Register() {
  return (
    <>
      <div className="area-flex-col mod-align-stretch mod-center">
        <COM_AuthShowcase prScreenshotSrc={IMG_ApplicationDemo}>
          <COM_FormRegister />
        </COM_AuthShowcase>
      </div>
      <COM_FooterAuth />
    </>
  );
}

export default PAG_Register;
