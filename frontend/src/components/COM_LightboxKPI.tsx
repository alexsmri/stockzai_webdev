import { useLightbox } from '../context/CTX_Lightbox';
import COM_Lightbox from './COM_Lightbox';
import { useState } from 'react';
import COM_ChartLine from './COM_ChartLine';
import { getKPIText } from '../utils/functions';
import COM_TableKPIDetail from './COM_TableKPIDetail';
import { getKPIDetails } from '../utils/functions';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync, useWindowDimensions } from '../hooks/hooks';
import COM_IndicatorChange from './COM_IndicatorChange';
import { MOBILE_BREAKPOINT } from '../constants';
import type { TYP_APIResponseKPI } from '../types/types';

const KPI_BLOB_ROLES = ['ratios', 'valuation'];

interface PI_LightboxKPI {
  prOnDetailsRef?: (element: HTMLDivElement | null) => void;
}

export default function COM_LightboxKPI({ prOnDetailsRef }: PI_LightboxKPI = {}) {
  const { stIsOpen: isOpen, stSelectedKPI: selectedKPI, handleClose: close } = useLightbox();
  const store = useCompaniesStore();
  const [kpiCatalog, setKpiCatalog] = useState<TYP_APIResponseKPI | null>(null);
  const { width } = useWindowDimensions();

  useCompaniesStoreSync<TYP_APIResponseKPI>(store, 'PropertyCompanyKPIs', setKpiCatalog);

  if (!isOpen || !kpiCatalog || !selectedKPI) return null;

  const utKPIDetails = getKPIDetails({ prKPI: selectedKPI, prKPIs: kpiCatalog });
  const utRole = utKPIDetails['role'];

  return (
    <>
      <COM_Lightbox isOpen={isOpen} onClose={close}>
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
            {KPI_BLOB_ROLES.includes(utRole) && (
              <COM_TableKPIDetail prKPI={selectedKPI} prOnMount={prOnDetailsRef} />
            )}
          </div>
        </div>
      </COM_Lightbox>
    </>
  );
}
