import { lazy, Suspense } from "react";

interface PI_IconColor {
  prColor: string;
  prPath: string;        // without ".svg"
  prWidth?: string;
  prHeight?: string;
}

function CO_IconColor({
  prColor,
  prPath,
  prWidth = "20%",
  prHeight = "20%",
}: PI_IconColor) {
  const IconComponent = lazy(() =>
    import(`../assets/media/${prPath}.svg?react`)
  );

  return (
    <Suspense fallback={null}>
      <IconComponent
        style={{ color: prColor }}
        width={prWidth}
        height={prHeight}
      />
    </Suspense>
  );
}

export default CO_IconColor;