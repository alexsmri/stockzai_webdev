import api from "../api"
import type { SearchAPIResponse } from "../types/types";
import BaseAPIStore from "./BaseStores";

export default class SearchStore extends BaseAPIStore<SearchAPIResponse> {

    private query: string

    private constructor(query: string) {
        super();
        this.query = query;
    }
    static async create(query: string): Promise<SearchStore> {
        const store = new SearchStore(query);
        await store.init();
        return store;
    }
    protected async fetch() {
        const company = await api.get(`/api/companies/search/${this.query}/`);
        return company.data
    }

  };

  