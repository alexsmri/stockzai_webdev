import type { ReactNode } from 'react';
import COM_Sidebar from '../components/COM_Sidebar';
import COM_Breadcrumbs from '../components/COM_Breadcrumbs';
import COM_Footer from '../components/COM_Footer';

export default function STR_ApplicationPage({
  prTitle,
  children,
}: {
  prTitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="area-flex-row mod-gap-none mod-padding-none"
      style={{ minHeight: '100vh', alignItems: 'stretch' }}
    >
      <COM_Sidebar />
      <div className="area-application">
        <COM_Breadcrumbs />
        <div className="area-application-body" style={{ flex: 1, width: '100%' }}>
          {prTitle && <h1 className="look-text-x7 mod-align-left">{prTitle}</h1>}
          {children}
        </div>
        <COM_Footer />
      </div>
    </div>
  );
}
