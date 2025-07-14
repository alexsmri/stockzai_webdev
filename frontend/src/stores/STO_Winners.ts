import api from "../api"
import type { APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_Winners extends BaseAPIStore<APIResponse> {

    private constructor() {
        super();
    }
    static async create(): Promise<STO_Winners> {
        const store = new STO_Winners();
        await store.init();
        return store;
    }
    async fetch() {
        const winners = await api.get(`/api/companies/winners/`);
        return winners.data.msg
    }

  };

  