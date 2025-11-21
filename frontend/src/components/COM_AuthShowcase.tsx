import type { ReactNode } from 'react';
import { useWindowDimensions } from '../hooks/hooks';
import { TABLET_BREAKPOINT } from '../constants';
import { scale } from '../utils/functions';

const WRAPPER_CLASSES = {
  mobile: 'area-flex-col mod-wh-full mod-gap-xl',
  desktop: 'area-flex-row mod-wh-full mod-gap-xl',
};

const IMAGE_WIDTH_CONSTANT = 30;
const IMAGE_WIDTHS = {
  mobile: scale(IMAGE_WIDTH_CONSTANT),
  desktop: `clamp(${scale(IMAGE_WIDTH_CONSTANT)}, 100%, ${scale(2 * IMAGE_WIDTH_CONSTANT)})`,
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
  const imgWidth = isMobile ? IMAGE_WIDTHS.mobile : IMAGE_WIDTHS.desktop;
  return (
    <div className={wrapperClass}>
      <div className="area-flex-col mod-align-stretch">{children}</div>
      <div
        style={{
          width: imgWidth,
          height: 'auto',
          overflow: 'hidden',
          justifyContent: 'start',
          paddingLeft: `${scale(2)}`,
        }}
      >
        <img
          src={prScreenshotSrc}
          alt={prScreenshotAlt}
          style={{ width: imgWidth, height: 'auto' }}
        />
      </div>
    </div>
  );
}

export default COM_AuthShowcase;
