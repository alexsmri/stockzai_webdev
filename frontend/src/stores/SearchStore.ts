import api from "../api"
import type { SearchAPIResponse } from "../types/types";
import { BaseAPIStore } from "./BaseStores";

export default class SearchStore extends BaseAPIStore<SearchAPIResponse> {

    private query: string
    private unique?: boolean

    private constructor(query: string, unique: boolean = false) {
        super();
        this.query = query;
        this.unique = unique;
    }
    static async create(query: string, unique: boolean = false): Promise<SearchStore> {
        const store = new SearchStore(query, unique);
        await store.init();
        return store;
    }
    async fetch() {
        const company = await api.get(`/api/companies/search/${this.query}/?unique=${this.unique}`);
        return company.data
    }

  };

  