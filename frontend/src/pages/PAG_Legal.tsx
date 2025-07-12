import COM_Footer from '../components/COM_Footer';
import COM_Navbar from '../components/COM_Navbar';
import HTML_Contact from '../assets/html/contact.html?raw';
import HTML_PRIVACY from '../assets/html/privacy_policy.html?raw';
import { useParams } from 'react-router-dom';
import COM_MenuLegal from '../components/COM_MenuLegal';
import COM_TableOfContents from '../components/COM_TableOfContents';

const LEGAL_PAGE_LOOKUP: Record<string, string> = {
  contact: HTML_Contact,
  data: HTML_PRIVACY,
};

const LEGAL_PAGE_NAMES: Record<string, string> = {
  contact: 'Contact',
  data: 'Data protection Declaration',
};
const LEGAL_PAGE_ROUTES = {
  contact: '/legal/contact',
  data: '/legal/data',
};

const LEGAL_PAGE_CONTENTS: Record<string, Record<string, string>> = {
  contact: {
    '#identification': 'Identification',
    '#dispute_resolution': 'Dispute Resolution',
  },
  data: {
    '#server_log': 'Server Log',
    '#contact': 'Contact',
    '#customer_account': 'Customer Account',
    '#advertising': 'Advertising',
    '#cookies': 'Cookies',
    '#rights': 'Rights',
  },
};

export default function PAG_Legal() {
  const { page } = useParams<{ page: string }>();
  return (
    <>
      <COM_Navbar />
      {page && Object.keys(LEGAL_PAGE_LOOKUP).includes(page) && (
        <div className="area-grid-col-docs">
          <COM_MenuLegal
            prLegalPageDict={LEGAL_PAGE_ROUTES}
            prCurrentPage={page}
            prLegalNameDict={LEGAL_PAGE_NAMES}
          />
          <div className="area-flex-col">
            <h1 className="look-text-x7">{LEGAL_PAGE_NAMES[page]}</h1>
            <div className="area-grid-col-toc">
              <div
                className="area-flex-col mod-align-left"
                dangerouslySetInnerHTML={{ __html: LEGAL_PAGE_LOOKUP[page] }}
              />
              <COM_TableOfContents prContentDict={LEGAL_PAGE_CONTENTS[page]} />
            </div>
          </div>
        </div>
      )}
      <COM_Footer />
    </>
  );
}
