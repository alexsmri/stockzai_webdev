import type { LandingSegment } from './landingContent';

interface LandTextProps {
  prSegments: LandingSegment[];
}

function DCOM_LandText({ prSegments }: LandTextProps) {
  return (
    <>
      {prSegments.map((segment, index) => (
        <span key={index} className={segment.dim ? 'lp-dim' : 'lp-bright'}>
          {segment.text}
        </span>
      ))}
    </>
  );
}

export default DCOM_LandText;
