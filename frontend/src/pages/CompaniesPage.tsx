import { useParams } from "react-router-dom";
import SectionInfo from "../components/SectionInfo";
import ScoreRadial from "../components/ScoreRadial";
import CardInfo from "../components/CardInfo";
import { CompanyStoreProvider } from "../context/CompanyStoreContext";
import { KPIStoreProvider } from "../context/KPIStoreContext";
import NotFound from "./NotFound";
import KPILightbox from "../components/KPILightbox";
import TableInfo from "../components/TableInfo";
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
            <div className="flex flex-col gap-30">
              <KPILightbox />
              <SectionInfo title="Scores.">
                <ScoreRadial KPI="financial_score" />
                <ScoreRadial KPI="valuation_score" />
              </SectionInfo>
              <SectionInfo title="Basics.">
                <CardInfo KPI="name" />
                <CardInfo KPI="sector" />
                <CardInfo KPI="industry" />
                <CardInfo KPI="country" />
                <CardInfo KPI="currency" />
                <CardInfo KPI="fullTimeEmployees" />
              </SectionInfo>
              <SectionInfo title="Financials.">
                <TableInfo table_role="income_statement" />
                <TableInfo table_role="balance_sheet" />
                <TableInfo table_role="cashflow_statement" />
              </SectionInfo>
            </div>
          </CompanyStoreProvider>
        </KPIStoreProvider>
      </LightboxProvider>
    </>
  );
}
export default CompaniesPage;
