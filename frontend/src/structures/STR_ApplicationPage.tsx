import type { ReactNode } from 'react';
import COM_Sidebar from '../components/COM_Sidebar';
import COM_Breadcrumbs from '../components/COM_Breadcrumbs';

export default function STR_ApplicationPage({
  prTitle,
  children,
}: {
  prTitle: string;
  children: ReactNode;
}) {
  return (
    <div
      className="area-flex-row mod-gap-none mod-padding-none"
      style={{ minHeight: '100vh', alignItems: 'stretch' }}
    >
      <COM_Sidebar />
      <div
        className="area-flex-col mod-gap-l mod-padding-hero mod-align-left"
        style={{ flex: 1, width: '100%' }}
      >
        <COM_Breadcrumbs />
        <h1 className="look-text-x7 mod-align-left">{prTitle}</h1>
        <div
          className="area-flex-col mod-postion-relative mod-gap-none"
          style={{ alignItems: 'stretch', width: '100%' }}
        ></div>

        {children}
      </div>
    </div>
  );
}
