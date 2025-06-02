import api from "../api"
import type { KPIAPIResponse } from "../types/types";
import BaseAPIStore from "./BaseStores";

export default class KPIStore extends BaseAPIStore<KPIAPIResponse>{
    constructor() {
        super()
    }

    static async create(): Promise<KPIStore> {
        const store = new KPIStore();
        await store.init();
        return store;
    }

    async fetch() {
        const kpis = await api.get(`/api/companies/kpis/`);
        return kpis.data

  };
}
  