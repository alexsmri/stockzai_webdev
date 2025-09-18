import api from "../api"
import type { ITF_Fillable } from "../context/CTX_BaseStore";
import type { TYP_APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_Companies extends BaseAPIStore<TYP_APIResponse> implements ITF_Fillable {

    private symbol: string

    private constructor(symbol: string) {
        super();
        this.symbol = symbol;
    }
    static create(symbol: string): STO_Companies {
        const store = new STO_Companies(symbol);
        store.init();
        return store;
    }
    async fetch() {
        try {
        const company = await api.get(`/api/companies/${this.symbol}/`, { responseType: "json" });
        console.log(company)
        return company.data.msg
        } catch {
            return {}
        }
    }

  };

  