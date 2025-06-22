import { useParams } from "react-router-dom";
import CO_SectionInfo from "../components/CO_SectionInfo";
import ScoreRadial from "../components/CO_ScoreRadial";
import CO_Navbar from "../components/CO_Navbar";
import { CompanyStoreProvider } from "../context/CompanyStoreContext";
import { KPIStoreProvider } from "../context/KPIStoreContext";
import NotFound from "./NotFound";
import KPILightbox from "../components/CO_LightboxKPI";
import CO_TableInfo from "../components/CO_TableInfo";
import { LightboxProvider } from "../context/LightboxContext";

function CompaniesPage() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <NotFound />;
  }

  return (
    <>
      <LightboxProvider>
        <KPIStoreProvider args={[]}>
          <CompanyStoreProvider args={[symbol]}>
            <CO_Navbar />
            <h1 className="look-text-x7">{symbol}</h1>
            <div className="area-flex-col mod-gap-xl mod-padding-xl">
            <div className="area-flex-row mod-flex-grow-children">
              <KPILightbox />
              <CO_SectionInfo title="Scores.">
                <ScoreRadial KPI="financial_score" />
                <ScoreRadial KPI="valuation_score" />
              </CO_SectionInfo>
              <CO_SectionInfo title="Basics.">
                <CO_TableInfo prTableRole="basics" />
              </CO_SectionInfo>
            </div>
              <CO_SectionInfo title="Financials.">
                <CO_TableInfo prTableRole="income_statement" />
                <CO_TableInfo prTableRole="balance_sheet" />
                <CO_TableInfo prTableRole="cashflow_statement" />
              </CO_SectionInfo>
            </div>
          </CompanyStoreProvider>
        </KPIStoreProvider>
      </LightboxProvider>
    </>
  );
}
export default CompaniesPage;
