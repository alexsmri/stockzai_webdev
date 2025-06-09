import { createContext, useContext, useState } from "react";

interface LightboxContextType {
  stIsOpen: boolean;
  handleLBOpen: (KPI: string) => void;
  handleClose: () => void;
  stSelectedKPI: string | null;
}

const LightboxContext = createContext<LightboxContextType | undefined>(
  undefined
);

export const LightboxProvider = ({
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
    <LightboxContext.Provider
      value={{
        stIsOpen,
        handleLBOpen,
        handleClose,
        stSelectedKPI,
      }}
    >
      {children}
    </LightboxContext.Provider>
  );
};

export const useLightbox = () => {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside LightboxProvider");
  return ctx;
};
