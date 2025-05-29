import { useParams } from "react-router-dom";
import SectionInfo from "../components/SectionInfo";
import RadialScore from "../components/ScoreInfo";
import CardInfo from "../components/CardInfo";
import { CompanyStoreProvider } from "../context/CompanyStoreProvider";
import NotFound from "./NotFound";

function CompaniesPage() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <NotFound />;
  }

  return (
    <>
      <CompanyStoreProvider symbol={symbol}>
        <SectionInfo title="Scores.">
          <div>
            <RadialScore KPI="financial_score" />
            <RadialScore KPI="valuation_score" />
          </div>
        </SectionInfo>
        <SectionInfo title="Basics.">
          <div>
            <CardInfo KPI="industry" />
            <CardInfo KPI="fullTimeEmployees" />
          </div>
        </SectionInfo>
      </CompanyStoreProvider>
    </>
  );
}
export default CompaniesPage;
