import api from "../api"
import type { APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_Companies extends BaseAPIStore<APIResponse> {

    private symbol: string

    private constructor(symbol: string) {
        super();
        this.symbol = symbol;
    }
    static async create(symbol: string): Promise<STO_Companies> {
        const store = new STO_Companies(symbol);
        await store.init();
        return store;
    }
    async fetch() {
        const company = await api.get(`/api/companies/${this.symbol}/`);
        console.log(company)
        return company.data.msg
    }

  };

  