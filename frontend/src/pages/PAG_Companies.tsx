import { useParams } from "react-router-dom";
import COM_SectionInfo from "../components/COM_SectionInfo";
import COM_ScoreRadial from "../components/COM_ScoreRadial";
import COM_Navbar from "../components/COM_Navbar";
import { PRV_CompanyStore } from "../context/CTX_CompanyStore";
import { PRV_KPIStore } from "../context/CTX_KPIStore";
import NotFound from "./PAG_404";
import COM_KPILightbox from "../components/COM_LightboxKPI";
import COM_TableInfo from "../components/COM_TableInfo";
import { PRV_Lightbox } from "../context/CTX_Lightbox";

function PAG_Companies() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <NotFound />;
  }

  return (
    <>
      <PRV_Lightbox>
        <PRV_KPIStore args={[]}>
          <PRV_CompanyStore args={[symbol]}>
            <COM_Navbar />
            <h1 className="look-text-x7">{symbol}</h1>
            <div className="area-flex-col mod-gap-xl mod-padding-xl">
              <div className="area-flex-row mod-flex-grow-children">
                <COM_KPILightbox />
                <COM_SectionInfo title="Scores.">
                  <COM_ScoreRadial KPI="financial_score" />
                  <COM_ScoreRadial KPI="valuation_score" />
                </COM_SectionInfo>
                <COM_SectionInfo title="Basics.">
                  <COM_TableInfo prTableRole="basics" />
                </COM_SectionInfo>
              </div>
              <COM_SectionInfo title="Ratios.">
                <COM_TableInfo prTableRole="ratios" />
                <COM_TableInfo prTableRole="valuation" />
              </COM_SectionInfo>
              <COM_SectionInfo title="Financials.">
                <COM_TableInfo prTableRole="income_statement" />
                <COM_TableInfo prTableRole="balance_sheet" />
                <COM_TableInfo prTableRole="cashflow_statement" />
              </COM_SectionInfo>
            </div>
          </PRV_CompanyStore>
        </PRV_KPIStore>
      </PRV_Lightbox>
    </>
  );
}
export default PAG_Companies;
