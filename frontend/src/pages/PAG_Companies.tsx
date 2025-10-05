import { useParams } from 'react-router-dom';
import COM_SectionInfo from '../components/COM_SectionInfo';
import COM_ScoreRadial from '../components/COM_ScoreRadial';
import { PRV_CompanyStore } from '../context/CTX_CompanyStore';
import { PRV_KPIStore } from '../context/CTX_KPIStore';
import NotFound from './PAG_404';
import COM_LightboxKPI from '../components/COM_LightboxKPI';
import COM_TableInfo from '../components/COM_TableInfo';
import STR_ApplicationPage from '../structures/STR_ApplicationPage';

function PAG_Companies() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <NotFound />;
  }

  return (
    <>
      <PRV_KPIStore args={[]} showFallback={true}>
        <PRV_CompanyStore args={[symbol]} showFallback={true}>
          <STR_ApplicationPage>
            <h1 className="look-text-x7">{symbol}</h1>
            <div className="area-flex-col mod-padding-xl mod-align-stretch">
              <div className="area-flex-wrap mod-flex-grow-children mod-padding-none">
                <COM_LightboxKPI />
                <COM_SectionInfo title="Scores." prShowChange={true}>
                  <COM_ScoreRadial KPI="financial_score" />
                  <COM_ScoreRadial KPI="valuation_score" />
                </COM_SectionInfo>
                <COM_SectionInfo title="Basics.">
                  <COM_TableInfo prTableRole="basics" />
                </COM_SectionInfo>
              </div>
              <div className="area-flex-wrap mod-flex-grow-children mod-align-start mod-padding-none">
                <COM_SectionInfo
                  title="Ratios."
                  prMenuOptions={{
                    ratios: 'Financial Ratios',
                    valuation: 'Valuation Ratios',
                  }}
                >
                  <COM_TableInfo prTableRole="ratios" />
                  <COM_TableInfo prTableRole="valuation" />
                </COM_SectionInfo>
                <COM_SectionInfo
                  title="Financials."
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
        </PRV_CompanyStore>
      </PRV_KPIStore>
    </>
  );
}
export default PAG_Companies;
