import api from "../api"
import type { TYP_APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_Search extends BaseAPIStore<TYP_APIResponse> {

    private query: string
    private unique?: boolean

    private constructor(query: string, unique: boolean = false) {
        super();
        this.query = query;
        this.unique = unique;
    }
    static create(query: string, unique: boolean = false): STO_Search {
        const store = new STO_Search(query, unique);
        store.init();
        return store;
    }
    async fetch() {
        const company = await api.get(`/api/companies/search/${this.query}/?unique=${this.unique}`);
        console.log(company)
        return company.data.msg
    }

  };

  