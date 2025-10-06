import { useState } from 'react';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import { getKPIText } from '../utils/functions';

export default function COM_CardInfo({ KPI }: { KPI: string }) {
  const store = useCompaniesStore();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useCompaniesStoreSync(store, 'PropertyCompanyProfile', setData);

  const latestEntries = (data as { latest_entries?: Record<string, unknown> })?.latest_entries ?? {};
  const rawValue = latestEntries[KPI];
  if (rawValue === undefined || rawValue === null) return null;
  const title = getKPIText(KPI);
  return (
    <>
      <div className="border border-subtle rounded-xs p-3">
        <strong>{title}</strong>
        <p>{rawValue as string | number}</p>
      </div>
    </>
  );
}
