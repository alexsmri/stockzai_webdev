import { lazy, Suspense } from "react";
import React from "react";

interface PI_IconColor {
  prColor: string;
  prPath: string;
  prWidth?: string;
  prHeight?: string;
  prRotation?: string;
}

const COM_IconColor = React.memo(function COM_IconColor({
  prColor,
  prPath,
  prWidth = "20%",
  prHeight = "20%",
  prRotation = "0"
}: PI_IconColor) {
  const IconComponent = lazy(() =>
    import(`../assets/media/${prPath}.svg?react`)
  );

  return (
    <Suspense fallback={null}>
      <IconComponent
        style={{ 
          color: prColor,
          transform: `rotate(${prRotation}deg`
        }}
        width={prWidth}
        height={prHeight}
        rotate={prRotation}
      />
    </Suspense>
  );
});

export default COM_IconColor;