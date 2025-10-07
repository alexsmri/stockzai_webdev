import { STO_Base } from "./STO_Base";

const ROUTE_CONFIG = {
  PropertyCompanyProfile: "/api/companies",
  PropertyCompanyKPIs: "/api/companies/kpis",
  PropertySearchResults: "/api/companies/search",
  PropertySearchCompletion: "/api/companies/search",
  PropertySearchComparison: "/api/companies/search",
  PropertyCompanyWinners: "/api/companies/winners",
  PropertyCompanyLeaderboard: "/api/companies/leaderboard",
  PropertyDistinctKPIValues: "/api/companies/distinct",
} as const;

export type ValidKeys = keyof typeof ROUTE_CONFIG;

export default class STO_Companies extends STO_Base<ValidKeys> {
  keys: ValidKeys[] = Object.keys(ROUTE_CONFIG) as ValidKeys[];
  routes = ROUTE_CONFIG;

  private constructor() {
    super({ storagePrefix: "companiesStore" });
  }

  static async create(): Promise<STO_Companies> {
    const store = new STO_Companies();
    store.init();
    return store;
  }

  init(): void {
    this.ensureAllKeysInitialized();
  }
}

