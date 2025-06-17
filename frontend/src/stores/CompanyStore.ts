import api from "../api"
import type { CompanyAPIResponse } from "../types/types";
import { BaseAPIStore } from "./BaseStores";

export default class CompanyStore extends BaseAPIStore<CompanyAPIResponse> {

    private symbol: string

    private constructor(symbol: string) {
        super();
        this.symbol = symbol;
    }
    static async create(symbol: string): Promise<CompanyStore> {
        const store = new CompanyStore(symbol);
        await store.init();
        return store;
    }
    async fetch() {
        const company = await api.get(`/api/companies/${this.symbol}/`);
        return company.data
    }

  };

  