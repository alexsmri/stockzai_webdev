interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

export default function COM_Lightbox({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
}: LightboxProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="area-lightbox mod-z-4"
        onClick={closeOnBackdrop ? onClose : undefined}
        role="presentation"
      >
        <div
          className="area-flex-col mod-wh-full"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
