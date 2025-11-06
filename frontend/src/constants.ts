import { scale } from "./utils/functions";

const environment_raw = import.meta.env.VITE_STRIPE_ENVIRONMENT;

const ENVIRONMENT = environment_raw === 'production' ? 'production' : 'dev';

export const STRIPE_PLANS = {
  pro: {
    pro_monthly: {
      link: ENVIRONMENT === 'dev' ? 'https://buy.stripe.com/test_cNifZgez4bHna5zaCZgbm00' : '',
      priceId: ENVIRONMENT === 'dev' ? 'price_1SOyiaBnrUSa2i9JrzxSZxzB' : '',
      price: 10,
      interval: '/month',
    },
  },
};

const PAYWALL_FLAG =
  typeof import.meta.env.VITE_PAYWALL_ENABLED === 'string'
    ? import.meta.env.VITE_PAYWALL_ENABLED
    : 'true';

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";
export const MOBILE_BREAKPOINT = 768;
export const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export const LANDINGPAGE_BUTTON_LINKS = {
  login: '/companies/search',
  anonymous: '/users/register',
};
export const REGISTRATION_PASSWORD_STORAGE_KEY = 'registration:password';
export const REGISTRATION_RESEND_COOLDOWN_SECONDS = 30;
export const COMPANY_PAGE_SECTION_WIDTH = `clamp(${scale(26)}, ${scale(32)}, 100%)`
export const PAYWALL_ENABLED =
  PAYWALL_FLAG.trim().toLowerCase() !== 'false' &&
  PAYWALL_FLAG.trim().toLowerCase() !== '0' &&
  PAYWALL_FLAG.trim().toLowerCase() !== 'no' &&
  PAYWALL_FLAG.trim().toLowerCase() !== 'off';

export const RISK_TOLERANCE_OPTIONS = {
  risk_zero: { label: 'Risk-Free (0)' },
  risk_ultra_conservative: { label: 'Ultra Conservative (0-1)' },
  risk_conservative: { label: 'Conservative (0-2)' },
  risk_balanced: { label: 'Balanced (0-3)' },
  risk_growth: { label: 'Growth (0-4)' },
  risk_aggressive: { label: 'Aggressive (0-5)' },
} as const;

export type RiskToleranceKey = keyof typeof RISK_TOLERANCE_OPTIONS;
