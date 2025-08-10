import { useLightbox } from '../context/CTX_Lightbox';
import COM_Lightbox from './COM_Lightbox';
import { useState } from 'react';
import COM_ChartLine from './COM_ChartLine';
import { getKPIText } from '../utils/functions';
import COM_TableKPIDetail from './COM_TableKPIDetail';
import { getKPIDetails } from '../utils/functions';
import { useKPIStore } from '../context/CTX_KPIStore';
import { useKPIStoreSync, useWindowDimensions } from '../hooks/hooks';
import COM_IndicatorChange from './COM_IndicatorChange';
import { MOBILE_BREAKPOINT } from '../constants';

const KPI_BLOB_ROLES = ['ratios', 'valuation'];

export default function COM_KPILightbox() {
  const { stIsOpen: isOpen, stSelectedKPI: selectedKPI, handleClose: close } = useLightbox();
  if (!isOpen) return null;
  const utKPIStore = useKPIStore();
  const [stKPIs, setStKPIs] = useState<Record<any, any> | null>(null);
  useKPIStoreSync(utKPIStore, setStKPIs);
  const { width } = useWindowDimensions();

  if (!stKPIs) return null;

  const utKPIDetails = getKPIDetails({ prKPI: selectedKPI, prKPIs: stKPIs });
  const utRole = utKPIDetails['role'];

  return (
    <>
      <COM_Lightbox isOpen={isOpen} onClose={close}>
        {selectedKPI && (
          <div className="area-flex-col mod-center">
            {width > MOBILE_BREAKPOINT ? (
              <div className="area-flex-wrap">
                <h2 className="look-text-x5">{getKPIText(selectedKPI)}</h2>
                <div className="mod-center">
                  <COM_IndicatorChange prKPI={selectedKPI} prShowDiv={true} />
                </div>
              </div>
            ) : (
              <h2 className="look-text-x4">{getKPIText(selectedKPI)}</h2>
            )}
            <div className="area-flex-wrap mod-flex-grow-children">
              <COM_ChartLine KPI={selectedKPI} />
              {KPI_BLOB_ROLES.includes(utRole) && <COM_TableKPIDetail prKPI={selectedKPI} />}
            </div>
          </div>
        )}
      </COM_Lightbox>
    </>
  );
}
