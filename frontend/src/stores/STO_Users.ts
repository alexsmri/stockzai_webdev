import { STO_Base } from "./STO_Base";

const ROUTE_CONFIG = {
  PropertyCredentials: "/api/users/credentials/",
  PropertyConsents: "/api/users/consents/",
  ActionVerification: "/api/users/verification/",
  ActionRegistrationCheck: "/api/users/register/check/",
  TokenVerificationRequest: "/api/users/verification/token/",
  TokenPasswordResetRequest: "/api/users/password-reset/token/",
  TokenPasswordResetValidation: "/api/users/password-reset/token/validate/",
  ActionPasswordReset: "/api/users/password-reset/",
  ActionRegistration: "/api/users/register/",
  ActionLogin: "/api/users/token/",
  ActionRefreshToken: "/api/users/token/refresh/",
  TokenLoginValidation: "/api/users/token/validate/",
  ActionEditProfile: "/api/users/edit/",
  ActionUnsubscribeNewsletter: "/api/users/unsubscribe-newsletter/",
  ActionSubscribeNewsletterRequest: "/api/users/subscribe-newsletter/token/",
  ActionSubscribeNewsletterVerify: "/api/users/subscribe-newsletter/verify/",
} as const;

export type ValidKeys = keyof typeof ROUTE_CONFIG;

const PERSISTED_KEYS: ValidKeys[] = [
  "ActionLogin",
  "PropertyCredentials",
  "ActionRefreshToken",
];

export default class STO_Users extends STO_Base<ValidKeys> {
  keys: ValidKeys[] = Object.keys(ROUTE_CONFIG) as ValidKeys[];
  routes = ROUTE_CONFIG;

  private constructor() {
    super({ storagePrefix: "userStore", persistedKeys: PERSISTED_KEYS });
  }

  static async create(): Promise<STO_Users> {
    const store = new STO_Users();
    store.init();
    return store;
  }

  init(): void {
    this.ensureAllKeysInitialized();
    for (const key of PERSISTED_KEYS) {
      const hydrated = this.hydrate(key);
      if (hydrated) {
        this.data[key] = hydrated;
        this.status[key] = "success";
        this.notify(key);
      }
    }
  }

  read(key: ValidKeys): unknown {
    this.ensureKeyInitialized(key);
    if (this.shouldPersist(key)) {
      const hydrated = this.hydrate(key);
      if (hydrated) {
        this.data[key] = hydrated;
      }
    }
    return this.data[key];
  }
}
