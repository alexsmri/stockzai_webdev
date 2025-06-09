import { useLightbox } from "../context/LightboxContext";
import Lightbox from "./Lightbox";
import ChartLine from "./ChartLine";

export default function KPILightbox() {
  const { isOpen, selectedKPI, close } = useLightbox();
  if (!isOpen) return null;

  return (
    <>
      <Lightbox isOpen={isOpen} onClose={close}>
        {selectedKPI && (
          <div className="flex">
            <ChartLine KPI={selectedKPI} />
          </div>
        )}
      </Lightbox>
    </>
  );
}
