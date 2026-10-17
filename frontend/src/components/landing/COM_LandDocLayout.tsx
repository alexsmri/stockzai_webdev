import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import '../../assets/scss/landing/landing.scss';
import '../../assets/scss/landing/docs.scss';
import COM_Footer from '../COM_Footer';
import COM_LandNavbar from './COM_LandNavbar';
import DCOM_LandToc from './DCOM_LandToc';
import { useDocToc } from '../../hooks/hooks';

interface LandDocLayoutProps {
  prTitle: string;
  // Optional hero rendered above the document. It is expected to contain the page's h1.
  prHero?: ReactNode;
  children: ReactNode;
}

// Shared shell for text-heavy pages (backtest report, legal pages). The table of contents
// is generated from the h2/h3 headings of whatever is rendered inside.
function COM_LandDocLayout({ prTitle, prHero, children }: LandDocLayoutProps) {
  const refBody = useRef<HTMLElement>(null);
  const { items, activeId } = useDocToc(refBody, prTitle);

  useEffect(() => {
    document.title = `${prTitle} – stockz.ai`;
    window.scrollTo(0, 0);
  }, [prTitle]);

  const handleSelect = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  }, []);

  return (
    <div className="lp">
      <COM_LandNavbar />
      {prHero}
      <main className="lp-doc">
        <DCOM_LandToc prItems={items} prActiveId={activeId} prOnSelect={handleSelect} />
        <article ref={refBody} className="lp-doc-body">
          {!prHero && <h1 className="lp-doc-title">{prTitle}</h1>}
          {children}
        </article>
      </main>
      <COM_Footer />
    </div>
  );
}

export default COM_LandDocLayout;
