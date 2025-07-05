import api from "../api"
import type { APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_Search extends BaseAPIStore<APIResponse> {

    private query: string
    private unique?: boolean

    private constructor(query: string, unique: boolean = false) {
        super();
        this.query = query;
        this.unique = unique;
    }
    static async create(query: string, unique: boolean = false): Promise<STO_Search> {
        const store = new STO_Search(query, unique);
        await store.init();
        return store;
    }
    async fetch() {
        const company = await api.get(`/api/companies/search/${this.query}/?unique=${this.unique}`);
        return company.data.msg
    }

  };

  