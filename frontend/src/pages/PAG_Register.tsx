import COM_FormRegister from '../components/COM_FormRegister';
import COM_AuthShowcase from '../components/COM_AuthShowcase';
import IMG_ApplicationDemo from '../assets/media/IMG_ApplicationDemo.webp';

function PAG_Register() {
  return (
    <>
      <COM_AuthShowcase prScreenshotSrc={IMG_ApplicationDemo}>
        <COM_FormRegister />
      </COM_AuthShowcase>
    </>
  );
}

export default PAG_Register;
