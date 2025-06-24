import { useLightbox } from "../context/LightboxContext";
import Lightbox from "./CO_Lightbox";
import ChartLine from "./CO_ChartLine";

export default function KPILightbox() {
  const {
    stIsOpen: isOpen,
    stSelectedKPI: selectedKPI,
    handleClose: close,
  } = useLightbox();
  if (!isOpen) return null;

  return (
    <>
      <Lightbox isOpen={isOpen} onClose={close}>
        {selectedKPI && (
          <div className="mod-wh-full">
            <ChartLine KPI={selectedKPI} />
          </div>
        )}
      </Lightbox>
    </>
  );
}
