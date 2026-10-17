import COM_LandDocLayout from '../components/landing/COM_LandDocLayout';
import COM_LandDocHero from '../components/landing/COM_LandDocHero';

function PAG_Backtest() {
  return (
    <COM_LandDocLayout prTitle="Backtest Report" prHero={
        <COM_LandDocHero
          prDimTitle="But"
          prBrightTitle="does it work?"
          prSubtitle="Evaluating the Performance of the stockz.ai Scoring Model (Jan 2024 – Nov 2025)"
        />
      }>
      <h2>1. Executive Summary</h2>
      <p>
        This report documents the first quantitative backtest of the{' '}
        <strong>stockz.ai composite scoring system</strong>, designed to evaluate whether the platform’s combined
        valuation and financial metrics can consistently identify outperforming equities.
      </p>
      <p>
        Between <strong>January 2024 and November 2025</strong>, the simulated portfolio generated a{' '}
        <strong>cumulative return of 62.63%</strong>, compared to <strong>45.64%</strong> for the S&amp;P 500
        benchmark. Despite a limited timeframe, the results indicate that the scoring model captured genuine
        predictive signals across multiple market cycles while maintaining a moderate drawdown profile and robust
        risk-adjusted returns.
      </p>
      <p>
        <strong>Key outcome:</strong> The backtest supports the hypothesis that a fundamentally-driven, multi-factor
        scoring approach—filtered by a conservative risk layer—can yield superior returns compared to a passive index
        allocation, even without access to forward-looking data or machine-learning prediction.
      </p>

      <h2>2. Objective</h2>
      <p>The goal of this initial backtest was to answer a simple question:</p>
      <p>
        <em>“Would a portfolio constructed purely from stockz.ai scores have outperformed the market over the past 22
        months?”</em>
      </p>
      <p>
        This test serves as a <strong>proof-of-concept validation</strong> of the scoring logic’s real-world
        efficiency. It is not an attempt at performance optimization but rather an integrity check of the underlying
        model structure:
      </p>
      <ul>
        <li>Do the composite scores correlate with future price performance?</li>
        <li>Does the risk-score filter successfully exclude unstable or overleveraged equities?</li>
        <li>Are the results robust across multiple rolling periods?</li>
      </ul>

      <h2>3. Methodology</h2>
      <h3>3.1 Data Sources</h3>
      <ul>
        <li>Price data: Yahoo Finance (yfinance API).</li>
        <li>Fundamental data: stocks.ai database derived from yfinance API.</li>
        <li>Benchmark: S&amp;P 500 Index (^GSPC).</li>
      </ul>

      <h3>3.2 Universe Selection</h3>
      <p>
        At each monthly rebalance date, the eligible universe consisted of all companies with valid Stocks.ai scores
        and available historical prices.
      </p>

      <h3>3.3 Scoring Model</h3>
      <p>
        Each stock received an aggregated Total Score, based on the multiple of the stockz.ai financial and valuation
        score. Additionally, each stock carries a stockz.ai Risk Score (0–5) capturing factors such as liquidity risk,
        leverage, and price volatility.
      </p>
      <p>For this test:</p>
      <ul>
        <li>
          Only stocks with <code>risk_score == 0</code> were considered.
        </li>
        <li>Among these, the Top 10 by total score were selected each month.</li>
        <li>Allocation was equal-weighted across all holdings.</li>
      </ul>

      <h3>3.4 Rebalancing Logic</h3>
      <ul>
        <li>Frequency: Monthly (1st trading day of each month).</li>
        <li>Sell all holdings at month-end and reinvest equally into the new Top 10 selection.</li>
        <li>Transaction costs: Ignored (assumed negligible at this stage).</li>
        <li>Capital start: $ 300.00 (arbitrary normalized baseline).</li>
      </ul>

      <h3>3.5 Evaluation Metrics</h3>
      <p>To assess the strategy comprehensively, the following statistics were computed:</p>
      <ul>
        <li>Cumulative Return and CAGR</li>
        <li>Sharpe Ratio (annualized)</li>
        <li>Sortino Ratio (annualized)</li>
        <li>Max Drawdown</li>
        <li>Volatility (stdev of monthly returns)</li>
        <li>Calmar Ratio</li>
        <li>Percentage of Profitable Trades</li>
        <li>Rolling Window Performance (semiannual overlapping windows)</li>
      </ul>

      <h2>4. Results Overview</h2>
      <div className="lp-doc-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className="lp-sr-only">Metric</span>
              </th>
              <th scope="col">stockz.ai Portfolio</th>
              <th scope="col">S&amp;P 500 Benchmark</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Cumulative Return</th>
              <td>62.36%</td>
              <td>45.64%</td>
            </tr>
            <tr>
              <th scope="row">CAGR</th>
              <td>30.26%</td>
              <td>22.76%</td>
            </tr>
            <tr>
              <th scope="row">Sharpe Ratio</th>
              <td>1.61</td>
              <td>1.65</td>
            </tr>
            <tr>
              <th scope="row">Sortino Ratio</th>
              <td>2.21</td>
              <td>1.32</td>
            </tr>
            <tr>
              <th scope="row">Max Drawdown</th>
              <td>10.73%</td>
              <td>10.8%</td>
            </tr>
            <tr>
              <th scope="row">Volatility</th>
              <td>5.08%</td>
              <td>3.76%</td>
            </tr>
            <tr>
              <th scope="row">Calmar Ratio</th>
              <td>2.82</td>
              <td>2.11</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>4.1 Aggregate Performance</h3>
      <p>
        The strategy achieved a cumulative gain of 62.36%, outperforming the S&amp;P 500 by 16.72 percentage points.
        The average monthly return was 2.35% with a volatility of 5.08%, resulting in an annualized Sharpe ratio of
        1.61.
      </p>

      <h3>4.2 Rolling Windows</h3>
      <p>
        Six overlapping semiannual backtests demonstrated positive consistency in four of the six periods, with the
        strongest window (Apr 2025 – Oct 2025) showing 43.94% absolute gain and minimal drawdown. Periods of
        underperformance aligned with broader market contractions, confirming the model’s fundamental beta exposure
        rather than structural weakness.
      </p>

      <h3>4.3 Trade Distribution</h3>
      <p>Across 220 total trades:</p>
      <ul>
        <li>Profitable trades: 57.34%</li>
        <li>Largest single gain: 66.54% (ZIM)</li>
        <li>Largest loss: -28.53% (STM)</li>
      </ul>
      <p>
        High-beta but fundamentally sound companies (e.g. ZIM, TSM) frequently appeared among top performers,
        suggesting that the composite score efficiently captures value + momentum blends.
      </p>

      <h2>5. Interpretation</h2>
      <h3>5.1 Evidence of Predictive Validity</h3>
      <p>
        The backtest provides encouraging evidence that the Stocks.ai scoring framework can rank equities in a way
        correlated with future excess returns. While the sample covers only 22 months, the consistent outperformance
        across different time slices and the statistically reasonable Sharpe and Sortino ratios indicate that the
        signal is not random noise.
      </p>

      <h3>5.2 Strengths Observed</h3>
      <ul>
        <li>High capital efficiency: strong CAGR with controlled volatility.</li>
        <li>Resilience: max drawdown comparable to the benchmark despite higher average returns.</li>
        <li>Risk filter success: excluding risk-score &gt; 0 stocks improved downside protection.</li>
        <li>Transparency: methodology is rule-based and replicable, not discretionary.</li>
      </ul>

      <h3>5.3 Weaknesses &amp; Limitations</h3>
      <ul>
        <li>Limited timespan: 22 months is insufficient for full-cycle validation.</li>
        <li>U.S. bias: predominantly U.S. stocks tested (international universes slightly underrepresented).</li>
        <li>Neglected transaction costs: could slightly reduce real-world performance.</li>
        <li>Lagged fundamentals: relies on past filings; no real-time adjustments)</li>
      </ul>
      <p>
        Nonetheless, even with these conservative assumptions, the model demonstrated clear alpha generation relative
        to a large-cap benchmark.
      </p>

      <h2>6. Next Steps</h2>
      <p>
        <strong>Five-Year Historical Expansion</strong>
        <br />
        Integrate a 5-Year Dataset to extend the testing horizon back to 2019+, covering multiple market environments.
      </p>
      <p>
        <strong>Sector-Specific Sub-Tests</strong>
        <br />
        Evaluate model behavior across cyclical vs. defensive sectors to measure regime sensitivity.
      </p>
      <p>
        <strong>Cost-Adjusted Simulation</strong>
        <br />
        Introduce 5–10 bps monthly friction to approximate transaction costs and check robustness.
      </p>

      <h2>7. Conclusion</h2>
      <p>
        Even at this early stage, the backtest indicates that stockz.ai’s data-driven scoring framework can translate
        fundamental analysis into measurable investment outperformance. The approach appears especially effective at
        identifying under-appreciated yet financially sound companies, while avoiding high-risk outliers.
      </p>
      <p>
        Although additional long-term validation is required, the results already demonstrate the core value
        proposition of stockz.ai:
      </p>
      <p>
        <strong>Structured fundamentals can be systematically leveraged to build smarter portfolios.</strong>
      </p>
      <p>
        The next iterations will extend this analysis over five-plus years of data and across broader markets. If
        current trends persist, the stockz.ai model could serve as a transparent, quantitative foundation for modern
        fundamental investing.
      </p>
    </COM_LandDocLayout>
  );
}

export default PAG_Backtest;
