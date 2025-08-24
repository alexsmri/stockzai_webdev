import api from "../api"
import type { TYP_APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_KPI extends BaseAPIStore<TYP_APIResponse>{
    constructor() {
        super()
    }

    static async create(): Promise<STO_KPI> {
        const store = new STO_KPI();
        await store.init();
        return store;
    }

    async fetch() {
        const kpis = await api.get(`/api/companies/kpis/`);
        return kpis.data.msg

  };
}
  