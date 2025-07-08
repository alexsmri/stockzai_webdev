import { createContext, useContext, useState } from "react";

interface ITF_LightboxContext {
  stIsOpen: boolean;
  handleLBOpen: (KPI: string) => void;
  handleClose: () => void;
  stSelectedKPI: string | null;
}

const CTX_Lightbox = createContext<ITF_LightboxContext | undefined>(
  undefined
);

export const PRV_Lightbox = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stIsOpen, setStIsOpen] = useState(false);
  const [stSelectedKPI, setStSelectedKPI] = useState<string | null>(null);

  const handleLBOpen = (KPI: string) => {
    setStSelectedKPI(KPI);
    setStIsOpen(true);
  };

  const handleClose = () => {
    setStIsOpen(false);
    setStSelectedKPI(null);
  };

  return (
    <CTX_Lightbox.Provider
      value={{
        stIsOpen,
        handleLBOpen,
        handleClose,
        stSelectedKPI,
      }}
    >
      {children}
    </CTX_Lightbox.Provider>
  );
};

export const useLightbox = () => {
  const ctx = useContext(CTX_Lightbox);
  if (!ctx) throw new Error("useLightbox must be used inside PRV_Lightbox");
  return ctx;
};
