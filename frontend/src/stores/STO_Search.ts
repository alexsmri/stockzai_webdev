import api from "../api"
import type { TYP_APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_Search extends BaseAPIStore<TYP_APIResponse> {

    private query: string
    private unique: boolean
    private variant: string

    private constructor(query: string, unique: boolean = false, variant: string = "search") {
        super();
        this.query = query;
        this.unique = unique;
        this.variant = variant;
    }
    static create(query: string, unique: boolean = false, variant: string = "search"): STO_Search {
        const store = new STO_Search(query, unique, variant);
        store.init();
        return store;
    }
    async fetch() {
        try {
        const params = new URLSearchParams();
        params.set("unique", this.unique ? "true" : "false");
        if (this.variant) {
            params.set("variant", this.variant);
        }
        const company = await api.get(`/api/companies/search/${encodeURIComponent(this.query)}/?${params.toString()}`);
        console.log(company)
        return company.data.msg
        } catch {
            return {}
        }
    }

  };

  



