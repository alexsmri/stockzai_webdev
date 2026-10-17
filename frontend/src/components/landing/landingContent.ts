// All copy for the landing page lives here. Text segments flagged `dim: true`
// render in the muted tone, the rest in the bright tone (mirrors the Framer look).

export interface LandingSegment {
  text: string;
  dim?: boolean;
}

export const LANDING_NAV_LINKS = [
  // absolute so they also work from the doc pages (/backtest, /disclaimer, ...)
  { label: 'Scores', href: '/scores' },
  { label: 'Backtest', href: '/backtest' },
  { label: 'Pricing', href: '/#pricing' },
];

export const LANDING_ROUTES = {
  register: '/users/register',
  login: '/users/login',
  app: '/companies/search',
  pro: '/users/plans/select',
  backtest: '/backtest',
};

export const LANDING_STATS = [
  { value: '13.000+', label: 'companies' },
  { value: '20+', label: 'avg. hours saved / month' },
  { value: '400+', label: 'investors' },
];

export const LANDING_UNDERSTAND: LandingSegment[][] = [
  [{ text: 'Instantly' }, { text: ' understand any stock.', dim: true }],
  [{ text: 'See valuation, financials and risk in', dim: true }, { text: ' three clean scores.' }],
  [{ text: 'Make decisions', dim: true }, { text: ' with confidence.' }],
];

export const LANDING_PRICING = {
  free: {
    title: 'Free',
    intro: 'Explore stockz.ai at',
    price: '0$',
    features: ['Four free companies', 'Get to know the scores', 'See detailed KPIs'],
    cta: 'Try Free',
  },
  pro: {
    title: 'Pro',
    badge: 'Popular',
    intro: 'Unlock everything for',
    price: '10$',
    priceSuffix: ' / month',
    features: ['everything in Free', '13.000+ companies', 'Full risk analysis', 'Detailed sector leaderboards'],
    cta: 'Get Pro',
  },
};

// TODO: replace the placeholder answers with the final copy from Framer.
export const LANDING_FAQ = [
  {
    question: 'Why not use TradingView instead?',
    answer: '[Placeholder] Paste the answer from the Framer site here.',
  },
  {
    question: 'Where does stockz.ai get its data?',
    answer: '[Placeholder] Paste the answer from the Framer site here.',
  },
  {
    question: 'How do the scores work?',
    answer: '[Placeholder] Paste the answer from the Framer site here.',
  },
  {
    question: 'How often is the data refreshed?',
    answer: 'Data is refreshed every ~7 days.',
  },
];
