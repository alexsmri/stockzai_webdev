import COM_Navbar from '../components/COM_Navbar';
import COM_Footer from '../components/COM_Footer';
import COM_Hero from '../components/COM_Hero';
import COM_FormCode from '../components/COM_FormCode';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PAG_VericationCode() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const navigate = useNavigate();

  if (!uid) navigate('/');

  return (
    <>
      <COM_Navbar />
      <COM_Hero>
        <h2 className="look-text-x4">Enter Verification Code</h2>
        <p className="look-text-subtle mod-align-center">
          Please enter the code sent to your E-Mail. If you haven't recieved a code, please check
          your spam folder.
        </p>
        <COM_FormCode prUid={uid || ''} />
      </COM_Hero>
      <COM_Footer />
    </>
  );
}
