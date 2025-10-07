import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import COM_KPIInfoCard from '../components/COM_KPIInfoCard';
import DCOM_KPIInfoCard from '../components/dumb/DCOM_KPIInfoCard';
import COM_SectionInfo from '../components/COM_SectionInfo';
import COM_ScoreRadial from '../components/COM_ScoreRadial';
import { useCompaniesStore } from '../context/CTX_CompanyStore';
import { useCompaniesStoreSync } from '../hooks/hooks';
import COM_LightboxKPI from '../components/COM_LightboxKPI';
import COM_TableInfo from '../components/COM_TableInfo';
import STR_ApplicationPage from '../structures/STR_ApplicationPage';
import NotFound from './PAG_404';

type CompanyProfileRecord = {
  latest_entries?: Record<string, unknown>;
  company_intel?: Record<string, Record<string, number>>;
  [key: string]: unknown;
};

const TUTORIAL_STEPS = [
  { ref: '#hero-cta', text: 'Click here to start your journey!' },
  { ref: '.score-card', text: 'Here you can view detailed metrics.' },
  { ref: '#profile', text: 'Your profile lives up here.' },
];

function PAG_CompaniesContent({ symbol }: { symbol: string }) {
  const store = useCompaniesStore();
  const [companyData, setCompanyData] = useState<CompanyProfileRecord | null>(null);

  useCompaniesStoreSync<CompanyProfileRecord>(store, 'PropertyCompanyProfile', setCompanyData, {
    autoFetch: true,
    prUrlPaths: [symbol],
  });

  useEffect(() => {
    void store.get('PropertyCompanyKPIs');
  }, [store]);

  const latestEntries = companyData?.latest_entries ?? {};
  const symbolValue =
    (latestEntries?.SYMBOL as string | number | null | undefined) ??
    (latestEntries?.symbol as string | number | null | undefined) ??
    symbol;
  const nameValue =
    (latestEntries?.name as string | number | null | undefined) ??
    (latestEntries?.NAME as string | number | null | undefined) ??
    '-';

  return (
    <STR_ApplicationPage>
      <div className="area-flex-col mod-padding-xl mod-align-stretch">
        <div className="area-flex-wrap mod-flex-grow-children mod-padding-none">
          <COM_LightboxKPI />
          <div
            className="area-flex-col mod-align-stretch mod-padding-none"
            style={{ maxWidth: '25%' }}
          >
            <div className="area-flex-row mod-padding-none mod-flex-grow-children mod-gap-s">
              <DCOM_KPIInfoCard prLabel="Symbol" prValue={symbolValue} />
              <COM_KPIInfoCard prTableRole="basics" prKPI="name" prValue={nameValue} />
            </div>
            <COM_SectionInfo title="Scores." prShowChange={true}>
              <div className="area-flex-row mod-padding-none mod-gap-s">
                <COM_ScoreRadial KPI="financial_score" />
                <COM_ScoreRadial KPI="valuation_score" />
              </div>
            </COM_SectionInfo>
          </div>
          <COM_SectionInfo title="Basics.">
            <COM_TableInfo prTableRole="basics" />
          </COM_SectionInfo>
        </div>
        <div className="area-flex-wrap mod-flex-grow-children mod-align-start mod-padding-none">
          <COM_SectionInfo
            prMenuOptions={{
              ratios: 'Financial Ratios',
              valuation: 'Valuation Ratios',
            }}
          >
            <COM_TableInfo prTableRole="ratios" />
            <COM_TableInfo prTableRole="valuation" />
          </COM_SectionInfo>
          <COM_SectionInfo
            prMenuOptions={{
              income_statement: 'Income Statement',
              balance_sheet: 'Balance Sheet',
              cashflow_statement: 'Cashflow Statement',
            }}
          >
            <COM_TableInfo prTableRole="income_statement" />
            <COM_TableInfo prTableRole="balance_sheet" />
            <COM_TableInfo prTableRole="cashflow_statement" />
          </COM_SectionInfo>
        </div>
      </div>
    </STR_ApplicationPage>
  );
}

function PAG_Companies() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <NotFound />;
  }

  return <PAG_CompaniesContent symbol={symbol} />;
}

export default PAG_Companies;
