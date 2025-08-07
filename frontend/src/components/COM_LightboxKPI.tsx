import { useLightbox } from '../context/CTX_Lightbox';
import COM_Lightbox from './COM_Lightbox';
import COM_ChartLine from './COM_ChartLine';
import { getKPIText } from '../utils/functions';
import COM_Hero from './COM_Hero';
import COM_TableInfo from './COM_TableInfo';

export default function COM_KPILightbox() {
  const { stIsOpen: isOpen, stSelectedKPI: selectedKPI, handleClose: close } = useLightbox();
  if (!isOpen) return null;

  return (
    <>
      <COM_Lightbox isOpen={isOpen} onClose={close}>
        {selectedKPI && (
          <div className="mod-wh-full">
            <COM_Hero>
              <h2 className="look-text-x5">{getKPIText(selectedKPI)}</h2>
              <div className="area-flex-row">
                <div className="area-flex-wrap" width={'70%'}>
                  <COM_ChartLine KPI={selectedKPI} />
                </div>
              </div>
            </COM_Hero>
          </div>
        )}
      </COM_Lightbox>
    </>
  );
}
