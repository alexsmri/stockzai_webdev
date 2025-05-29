export function getColor(score: number): string {
  if (score >= 8) {
    return "#4caf50"; // Green for high scores
  } else if (score >= 5) {
    return "#ff9800"; // Orange for medium scores
  } else {
    return "#f44336"; // Red for low scores
  }
}

export function getDashOffset(score: number): string {
  const offset = 264 - score * (234.667 / 10);
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
  DepreciationAmortizationDepletion: "Depreciation/Amortization/Depletion",
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
  pr_score: "PR Score",
  financial_score: "Financial Score",
  valuation_score: "Valuation Score",
  news_plaintext: "News",
  marketCap: "Market Capitalization",
  PriceToSales: "Price to Sales",
  PriceToFreeCashflow: "Price to Free Cash Flow",
  enterpriseValue: "Enterprise Value",
  EVtoEBITDA: "EV/EBITDA",
  EVtoSales: "EV/Sales",
  EBITDA: "EBITDA",
  FreeCashFlow: "Free Cash Flow",
  OrdinarySharesNumber: "Number of Shares",
};

return KPI_TITLE_LOOKUP[KPI] || null;
}