import { useParams } from "react-router-dom";
import InfoSection from "../components/InfoSection";
import RadialScore from "../components/RadialScore";
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
        <InfoSection title="Scores.">
          <div>
            <RadialScore scoreKPI="financial_score" score={8} />
            <RadialScore scoreKPI="valuation_score" score={8} />
          </div>
        </InfoSection>
      </CompanyStoreProvider>
    </>
  );
}
export default CompaniesPage;
