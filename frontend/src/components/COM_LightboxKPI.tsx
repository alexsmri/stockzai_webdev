import { useLightbox } from "../context/CTX_Lightbox";
import COM_Lightbox from "./COM_Lightbox";
import COM_ChartLine from "./COM_ChartLine";

export default function COM_KPILightbox() {
  const {
    stIsOpen: isOpen,
    stSelectedKPI: selectedKPI,
    handleClose: close,
  } = useLightbox();
  if (!isOpen) return null;

  return (
    <>
      <COM_Lightbox isOpen={isOpen} onClose={close}>
        {selectedKPI && (
          <div className="mod-wh-full">
            <COM_ChartLine KPI={selectedKPI} />
          </div>
        )}
      </COM_Lightbox>
    </>
  );
}
