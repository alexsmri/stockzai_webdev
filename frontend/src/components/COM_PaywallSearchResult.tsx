import ICON_Alert from "../assets/media/ICON_Alert.svg?react";

interface PI_PaywallSearchResult {
  prIsRedacted: boolean;
}

export default function COM_PaywallSearchResult({ prIsRedacted }: PI_PaywallSearchResult) {
  if (!prIsRedacted) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        pointerEvents: "none",
        padding: "0.5rem",
      }}
    >
      <div
        className="look-div-solid area-flex-row mod-align-center"
        style={{
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.25)",
        }}
      >
        <ICON_Alert style={{ width: "1.25rem", height: "1.25rem" }} />
        <span className="look-text-x0 look-priority-high">Get Pro to view this ticker</span>
      </div>
    </div>
  );
}
