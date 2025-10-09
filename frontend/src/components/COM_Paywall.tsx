import { type JSX } from "react";
import COM_Plans from "./COM_Plans";

interface PI_Paywall {
  prIsOpen: boolean;
  prBackdropBlur?: string;
  prBackdropTint?: string;
  prChildren?: JSX.Element;
}

export default function COM_Paywall({
  prIsOpen,
  prBackdropBlur = "blur(28px)",
  prBackdropTint = "rgba(15, 23, 42, 0.65)",
  prChildren,
}: PI_Paywall) {
  if (!prIsOpen) {
    return null;
  }

  return (
    <div
      className="area-paywall"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: prBackdropBlur,
        backgroundColor: prBackdropTint,
        padding: "2rem",
      }}
    >
      <div
        className="look-div-solid area-flex-col mod-align-center"
        style={{
          width: "min(640px, 100%)",
          boxShadow: "0 24px 48px rgba(15, 23, 42, 0.45)",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        {prChildren ?? <COM_Plans />}
      </div>
    </div>
  );
}
