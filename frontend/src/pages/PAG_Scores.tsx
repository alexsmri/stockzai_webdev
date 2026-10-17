import COM_LandDocLayout from '../components/landing/COM_LandDocLayout';
import COM_LandDocHero from '../components/landing/COM_LandDocHero';

function PAG_Scores() {
  return (
    <COM_LandDocLayout
      prTitle="Scores"
      prHero={
        <COM_LandDocHero
          prDimTitle="Three circles"
          prBrightTitle="say it all."
          prSubtitle="How healthy is a company? Is that priced in? Are there any risks?"
        />
      }
    >
      <h2>General Principles</h2>
      <p>
        Both scores are sector-adjusted, meaning companies are always compared within their respective industries to
        eliminate structural differences (e.g., between Tech and Utilities).
      </p>
      <p>
        All final scores are scaled to a 0–100 range and updated regularly. Together, the Financial Score and
        Valuation Score provide a balanced view of a company’s fundamental health and market attractiveness.
      </p>

      <h2>Valuation Score</h2>
      <h3>Quick Summary</h3>
      <p>
        The Valuation Score measures how attractively a company is priced compared to its sector peers. It reflects
        whether a stock appears undervalued or overvalued based on fundamental valuation ratios such as P/E, P/B,
        EV/EBITDA, or Price-to-Sales.
      </p>

      <h3>Technical Description</h3>
      <p>
        The Valuation Score is derived from all KPIs classified under the valuation category. Each KPI is normalized
        against the company’s sector distribution using a function:
      </p>
      <pre className="lp-doc-code">
        <code>calc_kpi_score(sector, valuation, value, df)</code>
      </pre>
      <p>
        This function assigns each KPI a normalized score (typically between 0 and 10) depending on how the company’s
        value places in the sector percentile-wise.
      </p>
      <p>
        The final score is computed as the mean of all KPI scores, weighted by a certainty factor that reflects data
        coverage:
      </p>
      <pre className="lp-doc-code">
        <code>Valuation Score=(∑KPI Scores / n)×(n / N)</code>
      </pre>
      <p>Where:</p>
      <ul>
        <li>n = number of available KPIs</li>
        <li>N = total expected KPIs for that category</li>
      </ul>
      <p>
        This ensures that incomplete datasets still produce comparable but appropriately weighted results. The final
        score is stored as <code>valuation_score</code>, and the individual KPI contributions are serialized in JSON (
        <code>valScoresDict</code>) for visualization or later analysis.
      </p>
      <p>
        A higher Valuation Score generally indicates a cheaper valuation relative to peers, while a lower score
        indicates a more expensive valuation.
      </p>

      <h2>Financial Score</h2>
      <h3>Quick Summary</h3>
      <p>
        The Financial Score evaluates the financial strength and stability of a company. It summarizes how efficiently
        a company manages its assets, liabilities, and profitability compared to others in the same industry.
      </p>

      <h3>Technical Description</h3>
      <p>
        The Financial Score aggregates all KPIs under the ratios category — typically including metrics such as Return
        on Equity (ROE), Debt-to-Equity, Current Ratio, EBIT Margin, or Gross Margin.
      </p>
      <p>Each KPI is evaluated relative to the company’s sector through:</p>
      <pre className="lp-doc-code">
        <code>calc_kpi_score(sector, valuation, value, df)</code>
      </pre>
      <p>
        Each resulting KPI score is normalized between 0 and 10, allowing direct comparability across industries.
      </p>
      <p>The final Financial Score is the weighted average of all available ratio scores:</p>
      <pre className="lp-doc-code">
        <code>Financial Score=(∑KPI Scores / n)×(n / N)</code>
      </pre>
      <p>Where:</p>
      <ul>
        <li>n = number of available KPIs</li>
        <li>N = total expected KPIs for that category</li>
      </ul>
      <p>
        Here, the weighting term (n / N) reflects data completeness — higher values indicate greater confidence in the
        result. The output includes both the aggregate value (<code>financial_score</code>) and a detailed JSON record
        of individual KPI scores (<code>finScoresDict</code>).
      </p>

      <h2>Risk Score</h2>
      <h3>Quick Summary</h3>
      <p>
        The Risk Score measures a company’s overall exposure to financial and structural risks. It combines
        quantitative risk factors such as market capitalization, liquidity, balance sheet stability, and
        country-specific risk indices into one unified score. The result expresses how resilient or vulnerable a
        company is under adverse market conditions — the lower the score, the safer the profile; the higher the score,
        the riskier the investment.
      </p>

      <h3>Technical Description</h3>
      <p>
        The Risk Score aggregates multiple predefined risk categories, each defined in the internal{' '}
        <code>RISK_KPIS</code> configuration. Each category maps one or more KPIs to a corresponding risk dictionary,
        which links specific values or thresholds to discrete risk levels (1–5). These dictionaries are stored in the
        database table <code>risk_factors</code> and include for example:
      </p>
      <div className="lp-doc-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Risk Factor</th>
              <th scope="col">Example Dictionary</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Market Cap</th>
              <td>
                <code>{'{500 M: 1, 250 M: 2, 100 M: 3, 50 M: 4, 20 M: 5}'}</code>
              </td>
              <td>Smaller market caps imply higher risk</td>
            </tr>
            <tr>
              <th scope="row">Daily Volume</th>
              <td>
                <code>{'{1 M: 1, 0.75 M: 2, 0.5 M: 3, 0.25 M: 4, 0.1 M: 5}'}</code>
              </td>
              <td>Lower daily trading volume = higher liquidity risk</td>
            </tr>
            <tr>
              <th scope="row">Country (AML-index)</th>
              <td>
                <code>{'{"Vietnam": 2, "Myanmar": 4, "China": 3, "India": 1}'}</code>
              </td>
              <td>AML (anti-money-laundering) country exposure</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Step 1 – Retrieve KPI and Reference Mapping</h4>
      <p>
        For each <code>risk_type</code>, the system:
      </p>
      <ul>
        <li>
          Retrieves all corresponding KPIs from <code>RISK_KPIS[risk_type]</code>.
        </li>
        <li>
          Loads the associated <code>risk_dict</code> and scoring logic (<code>scoring = 1</code> means higher is
          better, otherwise lower is better).
        </li>
        <li>Fetches the current KPI value for the company</li>
      </ul>

      <h4>Step 2 – Determine Individual Risk Levels</h4>
      <p>For each risk factor:</p>
      <p>
        The KPI value is compared against the keys in the corresponding <code>risk_dict</code>.
      </p>
      <p>Depending on the scoring rule:</p>
      <ul>
        <li>If higher is better: the first threshold equal or below the value defines the risk category.</li>
        <li>If lower is better: the first threshold equal or above the value defines it.</li>
        <li>If the value is categorical (e.g., a country string), it is matched directly to the dictionary’s key.</li>
      </ul>

      <h4>Step 3 – Calculate Final Score</h4>
      <p>
        Once all applicable risk factors are scored, the overall <code>risk_score</code> is computed as:
      </p>
      <pre className="lp-doc-code">
        <code>Risk Score= 2 × (mean(risk levels)+max(risk level)) / 2</code>
      </pre>
      <p>
        This combines both the average and the worst-case exposure, ensuring that a single severe risk (e.g. operating
        in a high-risk country) is appropriately weighted. Multiplying by 2 scales the final output to a 0–10 range
        for consistency with other scores
      </p>

      <h3>Interpretation</h3>
      <ul>
        <li>0–2 = Low risk → financially stable, large-cap, high liquidity, low-risk region</li>
        <li>3–5 = Moderate risk → typical for diversified mid-caps or emerging markets</li>
        <li>6–10 = High risk → small or illiquid companies, poor balance sheets, or exposure to fragile jurisdictions</li>
      </ul>
      <p>
        The Risk Score complements the Financial and Valuation scores by quantifying potential downside exposure —
        allowing a more balanced assessment of a company’s risk–return profile.
      </p>
    </COM_LandDocLayout>
  );
}

export default PAG_Scores;
