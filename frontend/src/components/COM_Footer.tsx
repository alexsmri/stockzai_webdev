import Logo from '@/assets/media/LOGO_schwarzquer.svg?react';
import { useNavigate } from 'react-router-dom';

export default function COM_Footer() {
  const navigate = useNavigate();
  return (
    <>
      <div className="area-flex-col mod-bottom">
        <Logo
          className="img-logo mod-cursor-pointer"
          onClick={() => {
            navigate('/');
          }}
        />
        <a href="/companies/search" className="look-button-subtle">
          Search
        </a>
        <a href="/companies/compare" className="look-button-subtle">
          Compare
        </a>
        <a href="/legal/data" className="look-button-subtle">
          Data Protection
        </a>
        <a href="/legal/contact" className="look-button-subtle">
          Contact
        </a>
      </div>
    </>
  );
}
