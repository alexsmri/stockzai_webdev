import { createContext, useContext, useState } from "react";

interface LightboxContextType {
  isOpen: boolean;
  openWithKPI: (KPI: string) => void;
  close: () => void;
  selectedKPI: string | null;
}

const LightboxContext = createContext<LightboxContextType | undefined>(
  undefined
);

export const LightboxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  const openWithKPI = (KPI: string) => {
    setSelectedKPI(KPI);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setSelectedKPI(null);
  };

  return (
    <LightboxContext.Provider
      value={{ isOpen, openWithKPI, close, selectedKPI }}
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
