interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Lightbox({ isOpen, onClose, children }: LightboxProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <div className="relative bg-grey p-6 rounded-1g w-[70%] h-[70%] overflow-auto">
          <button
            className="absolute top-2 right-2 text-white text-x1 cursor-pointer"
            onClick={onClose}
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </>
  );
}
