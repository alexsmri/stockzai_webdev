import { useParams } from "react-router-dom";
import SectionInfo from "../components/SectionInfo";
import ScoreRadial from "../components/ScoreRadial";
import CardInfo from "../components/CardInfo";
import { CompanyStoreProvider } from "../context/CompanyStoreContext";
import { KPIStoreProvider } from "../context/KPIStoreContext";
import NotFound from "./NotFound";
import TableInfo from "../components/TableInfo";

function CompaniesPage() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <NotFound />;
  }

  return (
    <>
    <KPIStoreProvider args={[]}>
      <CompanyStoreProvider args={[symbol]}>
        <SectionInfo title="Scores.">
          <div>
            <ScoreRadial KPI="financial_score" />
            <ScoreRadial KPI="valuation_score" />
          </div>
        </SectionInfo>
        <SectionInfo title="Basics.">
          <div>
            <CardInfo KPI="name" />
            <CardInfo KPI="sector" />
            <CardInfo KPI="industry" />
            <CardInfo KPI="country" />
            <CardInfo KPI="currency" />
            <CardInfo KPI="fullTimeEmployees" />
          </div>
        </SectionInfo>
        <SectionInfo title="Financials.">
          <TableInfo table_role="income_statement"/>
          <TableInfo table_role="balance_sheet"/>
          <TableInfo table_role="cashflow_statement"/>
        </SectionInfo>
      </CompanyStoreProvider>
      </KPIStoreProvider>
    </>
  );
}
export default CompaniesPage;
