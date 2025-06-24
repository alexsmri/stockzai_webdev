interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Lightbox({ isOpen, onClose, children }: LightboxProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="area-lightbox" onClick={onClose}>
        <div className="area-flex-col">
          {children}
        </div>
      </div>
    </>
  );
}
