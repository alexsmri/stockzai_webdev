import type { ReactNode } from 'react';
import { useWindowDimensions } from '../hooks/hooks';
import { TABLET_BREAKPOINT } from '../constants';
import COM_FooterAuth from './COM_FooterAuth';
import { scale } from '../utils/functions';

const WRAPPER_CLASSES = {
  mobile: 'area-flex-col mod-wh-full mod-gap-xl mod-space-between mod-padding-none',
  desktop: 'area-grid-col-2 mod-padding-none mod-wh-full',
};

interface ITF_AuthShowcaseProps {
  children: ReactNode;
  prScreenshotSrc: string;
  prScreenshotAlt?: string;
}

function COM_AuthShowcase({
  children,
  prScreenshotSrc,
  prScreenshotAlt = 'Application screenshot',
}: ITF_AuthShowcaseProps) {
  const { width } = useWindowDimensions();
  const isMobile = width <= TABLET_BREAKPOINT;
  const wrapperClass = isMobile ? WRAPPER_CLASSES.mobile : WRAPPER_CLASSES.desktop;
  return (
    <div className={wrapperClass} style={{ minHeight: '100vh' }}>
      <div
        className="area-flex-col"
        style={{ justifyContent: 'center', flexGrow: 1, paddingTop: scale(2) }}
      >
        {children}
      </div>
      <div
        className="look-ui-subtle"
        style={{
          width: '100%',
          flexGrow: 1,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: scale(2),
        }}
      >
        <img
          src={prScreenshotSrc}
          alt={prScreenshotAlt}
          style={{ minWidth: '60%', height: 'auto', padding: scale(2), marginTop: 'auto' }}
        />
        <COM_FooterAuth />
      </div>
    </div>
  );
}

export default COM_AuthShowcase;
