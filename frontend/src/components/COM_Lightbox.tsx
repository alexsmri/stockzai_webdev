interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function COM_Lightbox({ isOpen, onClose, children }: LightboxProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="area-lightbox mod-z-4" onClick={onClose}>
        <div className="area-flex-col mod-wh-full">{children}</div>
      </div>
    </>
  );
}

