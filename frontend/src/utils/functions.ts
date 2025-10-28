const KPI_SCORING_ZERO = -1;

export function scale(multiplier: number): string {
  if (!Number.isFinite(multiplier)) {
    throw new Error(`calcSize expects a finite number, received: ${multiplier}`);
  }
  return `calc(var(--default-font-size) * ${multiplier})`;
}

export function getScoreColor(score: number): string {
  if (score >= 6.6) {
    return "#00D26D";
  } else if (score >= 3.3) {
    return "#D0D0D0";
  } else {
    return "#EE0034";
  }
}
export function getChangeColor(utChange: number): string {
  if (utChange > 0) {
    return "#00D26D";
  } else if (utChange === 0) {
    return "#D0D0D0";
  } else {
    return "#EE0034";
  }
}

export function getPercentileColor(prPercentile: number) {
  if (prPercentile >= 6.6) {
    return "#00D26D";
  } else if (prPercentile >= 3.3) {
    return "#D0D0D0";
  } else {
    return "#EE0034";
  }
}
export function getChangeBackground(utChange: number): string {
  if (utChange > 0) {
    return "rgba(0, 210, 109, 0.2)";
  } else if (utChange === 0) {
    return "rgba(255, 255, 255, 0.2)";
  } else {
    return "rgba(238, 0, 52, 0.2)";
  }
}
export function getChangeDivClass(utChange: number): string {
  if (utChange > 0) {
    return "look-div-success";
  } else if (utChange === 0) {
    return "look-div-neutral";
  } else {
    return "look-div-failure";
  }
}

export function toNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatLargeNumber(number: number | string): string {
  const NUMBER_LOOKUP: Record<number, string> = {
    1000000000000: "T",
    1000000000: "B",
    1000000: "M",
    1000: "k",
  };

  function cleanInput(input: string | number): number | undefined {
    const inputCleaned = typeof input === "string" ? Number(input) : input;
    return Number.isNaN(inputCleaned) ? undefined : inputCleaned;
  }

  const numberCleaned = cleanInput(number)

  if (numberCleaned === undefined) {
    return String(number);
  }

  const key = Object.keys(NUMBER_LOOKUP)
    .map(Number)
    .sort((a, b) => b - a)
    .find((val) => Math.abs(numberCleaned) >= val);

  if (key !== undefined) {
    return `${(numberCleaned / key).toFixed(1)}${NUMBER_LOOKUP[key]}`;
  }

  return `${Math.round(numberCleaned * 1000) / 1000}`;
}

export function getDashOffset(score: number): string {
  const offset = 264 - score * (264 / 10);
  return offset.toString();
}

export function getScoreText(scoreKPI: "financial_score" | "valuation_score"): string {
  switch (scoreKPI) {
    case "financial_score":
      return "Financials";
    case "valuation_score":
      return "Valuation";
  }
}

export function getKPIText(KPI: string) {
  const KPI_TITLE_LOOKUP: Record<string, string> = {
    CashAndCashEquivalents: "Cash & Cash Equivalents",
    AccountsReceivable: "Accounts Receivable",
    Inventory: "Inventory",
    PrepaidAssets: "Prepaid Assets",
    OtherCurrentAssets: "Other Current Assets",
    CurrentAssets: "Total Current Assets",
    Properties: "Properties",
    MachineryFurnitureEquipment: "Machinery, Furniture & Equipment",
    GoodwillAndOtherIntangibleAssets: "Goodwill & Intangible Assets",
    LongTermEquityInvestment: "Long-Term Equity Investments",
    OtherNonCurrentAssets: "Other Non-Current Assets",
    TotalNonCurrentAssets: "Total Non-Current Assets",
    TotalAssets: "Total Assets",
    AccountsPayable: "Accounts Payable",
    OtherCurrentLiabilities: "Other Current Liabilities",
    CurrentLiabilities: "Total Current Liabilities",
    NonCurrentDeferredTaxesLiabilities: "Deferred Tax Liabilities",
    OtherNonCurrentLiabilities: "Other Non-Current Liabilities",
    TotalDebt: "Total Debt",
    TotalLiabilitiesNetMinorityInterest: "Total Liabilities (net of minority interest)",
    CommonStock: "Common Stock",
    RetainedEarnings: "Retained Earnings",
    AdditionalPaidInCapital: "Additional Paid-in Capital",
    TreasuryStock: "Treasury Stock",
    StockholdersEquity: "Stockholders' Equity",
    TotalEquityGrossMinorityInterest: "Total Equity (gross of minority interest)",
    TotalRevenue: "Total Revenue",
    CostOfRevenue: "Cost of Revenue",
    GrossProfit: "Gross Profit",
    SellingGeneralAndAdministration: "Selling, General & Admin",
    ResearchAndDevelopment: "R&D",
    DepreciationAndAmortizationInIncomeStatement: "Depreciation & Amortization",
    OperatingExpense: "Operating Expenses",
    EBIT: "EBIT",
    InterestIncomeNonOperating: "Interest Income (Non-Op)",
    InterestExpenseNonOperating: "Interest Expense (Non-Op)",
    OtherIncomeExpense: "Other Income/Expense",
    TotalOtherFinanceCost: "Total Other Finance Cost",
    PretaxIncome: "Pre-Tax Income",
    TaxProvision: "Tax Provision",
    NetIncome: "Net Income",
    NetIncomeCommonStockholders: "Net Income to Common",
    OperatingCashFlow: "Operating Cash Flow",
    NetIncomeFromContinuingOperations: "Net Income (Cont. Ops)",
    DepreciationAmortizationDepletion: "Depreciation / Amortization / Depletion",
    StockBasedCompensation: "Stock-Based Compensation",
    ChangeInWorkingCapital: "Change in Working Capital",
    InterestPaidCFO: "Interest Paid (CFO)",
    InterestReceivedCFO: "Interest Received (CFO)",
    IncomeTaxPaidSupplementalData: "Income Tax Paid",
    InvestingCashFlow: "Investing Cash Flow",
    CapitalExpenditure: "Capital Expenditures",
    PurchaseOfInvestment: "Investment Purchases",
    SaleOfInvestment: "Investment Sales",
    PurchaseOfPPE: "Purchase of PPE",
    SaleOfPPE: "Sale of PPE",
    FinancingCashFlow: "Financing Cash Flow",
    IssuanceOfDebt: "Debt Issuance",
    RepaymentOfDebt: "Debt Repayment",
    IssuanceOfCapitalStock: "Capital Stock Issued",
    RepurchaseOfCapitalStock: "Capital Stock Repurchased",
    DividendPaidCFO: "Dividends Paid",
    ChangesInCash: "Net Cash Change",
    EffectOfExchangeRateChanges: "FX Effect",
    BeginningCashPosition: "Cash at Beginning",
    EndCashPosition: "Cash at End",
    returnOnAssets: "Return on Assets (ROA)",
    returnOnEquity: "Return on Equity (ROE)",
    debtToEquity: "Debt to Equity",
    grossMargins: "Gross Margin",
    operatingMargins: "Operating Margin",
    profitMargins: "Profit Margin",
    trailingPE: "P/E Ratio (Trailing)",
    priceToBook: "Price-to-Book Ratio",
    currentRatio: "Current Ratio",
    quickRatio: "Quick Ratio",
    DividendPerShare: "Dividend per Share",
    sector: "Sector",
    fullTimeEmployees: "Employees",
    currency: "Currency",
    country: "Country",
    countriesAML: "AML Country Exposure",
    countriesFSI: "Financial Secrecy Exposure",
    industry: "Industry",
    website: "Website",
    webtext: "Website Description",
    business_summary: "Business Summary",
    news_link: "News Link",
    pr_report: "Press Reports",
    name: "Company Name",
    strenghts: "Strengths",
    weaknesses: "Weaknesses",
    opportunities: "Opportunities",
    threats: "Threats",
    innovation_score: "Innovation Score",
    sustainability_score: "Sustainability Score",
    risk_score: "Risk Score",
    riskScoresDict: "Risk Factors",
    pr_score: "PR Score",
    financial_score: "Financial Score",
    valuation_score: "Valuation Score",
    news_plaintext: "News",
    marketCap: "Market Capitalization",
    volume: "Trading Volume",
    price: "Price Level",
    freeFloat: "Free Float",
    altmanZScore: "Altman Z-Score",
    PriceToSales: "Price to Sales",
    PriceToFreeCashflow: "Price to Free Cash Flow",
    enterpriseValue: "Enterprise Value",
    EVtoEBITDA: "EV/EBITDA",
    EVtoSales: "EV/Sales",
    EBITDA: "EBITDA",
    FreeCashFlow: "Free Cash Flow",
    OrdinarySharesNumber: "Number of Shares",
  };

  return KPI_TITLE_LOOKUP[KPI] || KPI;
}

export function getRoleText(role: string) {
  const ROLE_TITLE_LOOKUP: Record<string, string> = {
    balance_sheet: "Balance Sheet",
    income_statement: "Income Statement",
    cashflow_statement: "Cashflow Statement",
    ratios: "Financial Ratios",
    valuation: "Valuation Ratios",
  }

  return ROLE_TITLE_LOOKUP[role] || null;
}

export function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function getKPIScoring(prKPI: string, prKPIs: Record<any, any>) {
  if (!prKPIs) return KPI_SCORING_ZERO * -1;
  const utKPIId = Object.keys(prKPIs).find((key) => {
    if (prKPIs[key]['KPI'] === prKPI) return key;
  });
  const utKPIInfo = prKPIs[utKPIId as string];
  const utKPIScoring =
    typeof utKPIInfo['scoring'] === 'number'
      ? utKPIInfo['scoring'] === 0
        ? KPI_SCORING_ZERO
        : 1
      : 1;

  return utKPIScoring;
}

export function getKPIDetails({prKPI, prKPIs}: {prKPI: string, prKPIs: Record<any, any>}) {
  for (const [, value] of Object.entries(prKPIs)) {
    if (value.KPI === prKPI) {
      return value
    }
  }
}

export function getKPIData({prKPI, prData}: {prKPI: string, prData: Record<any, any>}) {
  let latest_entry = prData.latest_entries[prKPI] || null
  let data = prData.company_intel[prKPI] || null
  return {latest_entry: latest_entry, data: data}
}

type BreadcrumbParam = {
  source: 'query' | 'path';
  key: string;
  transform?: (value: string) => string;
};

type BreadcrumbConfig = {
  base: string[];
  params?: BreadcrumbParam[];
};

const BREADCRUMB_CONFIG: Record<string, BreadcrumbConfig> = {
  '/companies/search': {
    base: ['Search'],
    params: [
      {
        source: 'query',
        key: 'q',
        transform: (value) => value.toUpperCase(),
      },
    ],
  },
  '/companies/page/:symbol': {
    base: ['Search'],
    params: [
      {
        source: 'path',
        key: 'symbol',
        transform: (value) => value.toUpperCase(),
      },
    ],
  },
  '/companies/top-stocks': {
    base: ['Search', 'Top Stocks'],
  },
  '/alerts': {
    base: ['Alerts'],
  },
  '/feedback': {
    base: ['Feedback'],
  },
};

function matchPathPattern(pattern: string, pathname: string): { matched: boolean; params: Record<string, string> } {
  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i += 1) {
    const patternSegment = patternSegments[i];
    const valueSegment = pathSegments[i];

    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.slice(1);
      params[paramName] = valueSegment;
      continue;
    }

    if (patternSegment !== valueSegment) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

function titleFromSegment(segment: string): string {
  return segment
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export function getBreadcrumbContent(pathname: string, search: string): string[] {
  const normalisedPath = pathname || '/';
  const searchParams = new URLSearchParams(search || '');

  for (const [pattern, config] of Object.entries(BREADCRUMB_CONFIG)) {
    const { matched, params } = matchPathPattern(pattern, normalisedPath);
    if (!matched) {
      continue;
    }

    const values: string[] = [...config.base];

    if (config.params) {
      config.params.forEach((paramConfig) => {
        let value: string | null = null;
        if (paramConfig.source === 'query') {
          value = (searchParams.get(paramConfig.key) || '').trim();
        } else if (paramConfig.source === 'path') {
          value = params[paramConfig.key] ?? '';
        }

        if (value) {
          const transformed = paramConfig.transform ? paramConfig.transform(value) : value;
          if (transformed) {
            values.push(transformed);
          }
        }
      });
    }

    return values;
  }

  const segments = normalisedPath.split('/').filter(Boolean);
  if (!segments.length) {
    return ['Home'];
  }
  return segments.map((segment) => titleFromSegment(segment));
}
