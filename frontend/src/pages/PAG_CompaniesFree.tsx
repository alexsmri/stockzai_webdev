import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
import COM_TutorialOverlay from '../components/COM_TutorialOverlay';
import { useLightbox } from '../context/CTX_Lightbox';
import COM_SectionRisk from '../components/COM_SectionRisk';
import COM_Loading from '../components/COM_Loading';
import { queryMatches } from '../utils/functions';

type CompanyProfileRecord = {
  latest_entries?: Record<string, unknown>;
  company_intel?: Record<string, Record<string, number>>;
  [key: string]: unknown;
};

const TUTORIAL_STEPS = [
  {
    key: 'scores',
    title: 'Start with the Scores',
    body: 'Review the aggregate financial and valuation scores here.',
  },
  {
    key: 'risk',
    title: 'Review Risk Scores',
    body: 'This panel highlights upcoming risk indicators alongside the basics.',
  },
  {
    key: 'profit-margin',
    title: 'Open Profit Margin Details',
    body: 'Click Profit Margin to launch the KPI lightbox.',
  },
  {
    key: 'kpi-details',
    title: 'Explore KPI Details',
    body: 'Use the lightbox table to compare history and percentile performance.',
  },
];

function PAG_CompaniesFreeContent({
  symbol,
  shouldShowTutorial,
}: {
  symbol: string;
  shouldShowTutorial: boolean;
}) {
  const store = useCompaniesStore();
  const normalizedSymbol = symbol.trim();
  const [companyDataFree, setCompanyDataFree] = useState<CompanyProfileRecord | null>(() => {
    const existing = store.read('PropertyCompanyProfileFree');
    return (existing as CompanyProfileRecord) ?? null;
  });
  const [isTutorialActive, setIsTutorialActive] = useState(shouldShowTutorial);
  const scoreSectionRef = useRef<HTMLDivElement | null>(null);
  const riskSectionRef = useRef<HTMLDivElement | null>(null);
  const profitMarginRef = useRef<HTMLParagraphElement | null>(null);
  const kpiDetailsRef = useRef<HTMLDivElement | null>(null);
  const { stIsOpen: isLightboxOpen, handleLBOpen } = useLightbox();

  const fetchPaths = useMemo<(string | number)[]>(
    () => (normalizedSymbol ? [normalizedSymbol] : []),
    [normalizedSymbol]
  );

  useCompaniesStoreSync<CompanyProfileRecord>(
    store,
    'PropertyCompanyProfileFree',
    setCompanyDataFree,
    {
      autoFetch: Boolean(normalizedSymbol),
      prUrlPaths: fetchPaths,
    }
  );

  const hasMatchingData =
    Boolean(normalizedSymbol) &&
    queryMatches('PropertyCompanyProfileFree', companyDataFree, { symbol: normalizedSymbol });

  useEffect(() => {
    void store.get('PropertyCompanyKPIs');
  }, [store]);

  useEffect(() => {
    if (!shouldShowTutorial) {
      setIsTutorialActive(false);
    }
  }, [shouldShowTutorial]);

  useEffect(() => {
    if (!isLightboxOpen) {
      kpiDetailsRef.current = null;
    }
  }, [isLightboxOpen]);

  const tutorialSteps = useMemo(() => {
    return [
      { ...TUTORIAL_STEPS[0], ref: scoreSectionRef },
      { ...TUTORIAL_STEPS[1], ref: riskSectionRef },
      {
        ...TUTORIAL_STEPS[2],
        ref: profitMarginRef,
        onContinue: () => handleLBOpen('profitMargins'),
      },
      { ...TUTORIAL_STEPS[3], ref: kpiDetailsRef },
    ];
  }, [scoreSectionRef, riskSectionRef, profitMarginRef, kpiDetailsRef, handleLBOpen]);

  if (!hasMatchingData || !companyDataFree) {
    return (
      <STR_ApplicationPage>
        <COM_Loading />
      </STR_ApplicationPage>
    );
  }

  const latestEntries = companyDataFree?.latest_entries ?? {};
  const symbolValue =
    (latestEntries?.SYMBOL as string | number | null | undefined) ??
    (latestEntries?.symbol as string | number | null | undefined) ??
    symbol;
  const nameValue =
    (latestEntries?.name as string | number | null | undefined) ??
    (latestEntries?.NAME as string | number | null | undefined) ??
    '-';

  const handleTutorialFinish = () => {
    setIsTutorialActive(false);
  };
  // Looks shit on mobile, especially the Scores / Name / SYMBOL Section. Gotta fix
  return (
    <STR_ApplicationPage>
      <div className="area-flex-col mod-padding-xl mod-align-stretch">
        <div className="area-flex-wrap mod-flex-grow-children mod-padding-none">
          <COM_LightboxKPI
            prOnDetailsRef={(element) => {
              kpiDetailsRef.current = element;
            }}
          />
          <div className="area-flex-col mod-align-stretch mod-padding-none">
            <div className="area-flex-row mod-padding-none mod-flex-grow-children mod-gap-s">
              <DCOM_KPIInfoCard prLabel="Symbol" prValue={symbolValue} />
              <COM_KPIInfoCard prTableRole="basics" prKPI="name" prValue={nameValue} />
            </div>
            <div ref={scoreSectionRef}>
              <COM_SectionInfo title="Scores." prShowChange={true}>
                <div className="area-flex-row mod-padding-none mod-gap-s">
                  <COM_ScoreRadial KPI="financial_score" />
                  <COM_ScoreRadial KPI="valuation_score" />
                </div>
              </COM_SectionInfo>
            </div>
          </div>
          <COM_SectionInfo title="Basics.">
            <COM_TableInfo prTableRole="basics" />
          </COM_SectionInfo>
          <div ref={riskSectionRef}>
            <COM_SectionRisk />
          </div>
        </div>
        <div className="area-flex-wrap mod-flex-grow-children mod-align-start mod-padding-none">
          <COM_SectionInfo
            prMenuOptions={{
              ratios: 'Financial Ratios',
              valuation: 'Valuation Ratios',
            }}
          >
            <COM_TableInfo
              prTableRole="ratios"
              prFree={true}
              prFocusKPI="profitMargins"
              prOnFocusKPIRef={(element) => {
                profitMarginRef.current = element;
              }}
            />
            <COM_TableInfo prTableRole="valuation" prFree={true} />
          </COM_SectionInfo>
          <COM_SectionInfo
            prMenuOptions={{
              income_statement: 'Income Statement',
              balance_sheet: 'Balance Sheet',
              cashflow_statement: 'Cashflow Statement',
            }}
          >
            <COM_TableInfo prTableRole="income_statement" prFree={true} />
            <COM_TableInfo prTableRole="balance_sheet" prFree={true} />
            <COM_TableInfo prTableRole="cashflow_statement" prFree={true} />
          </COM_SectionInfo>
        </div>
      </div>
      {isTutorialActive && (
        <COM_TutorialOverlay
          prSteps={tutorialSteps}
          prIsActive={isTutorialActive}
          onFinish={handleTutorialFinish}
        />
      )}
    </STR_ApplicationPage>
  );
}

function PAG_CompaniesFree() {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();
  const shouldShowTutorial = (searchParams.get('t') || '').toLowerCase() === 'true';

  if (!symbol) {
    return <NotFound />;
  }

  return <PAG_CompaniesFreeContent symbol={symbol} shouldShowTutorial={shouldShowTutorial} />;
}

export default PAG_CompaniesFree;
