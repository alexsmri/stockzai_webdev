import { scale } from "./utils/functions";

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
