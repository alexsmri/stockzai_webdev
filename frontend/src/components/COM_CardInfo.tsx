import { useState } from 'react';
import { useCompanyStore } from '../context/CTX_CompanyStore';
import { useCompanyStoreSync } from '../hooks/hooks';
import { getKPIText } from '../utils/functions';

export default function COM_CardInfo({ KPI }: { KPI: string }) {
  const store = useCompanyStore();
  const [data, setData] = useState<Record<string, any> | null>(null);

  useCompanyStoreSync(store, setData);

  if (!data || !data.latest_entries[KPI]) return null;
  const title = getKPIText(KPI);
  return (
    <>
      <div className="border border-subtle rounded-xs p-3">
        <strong>{title}</strong>
        <p>{data.latest_entries[KPI]}</p>
      </div>
    </>
  );
}
