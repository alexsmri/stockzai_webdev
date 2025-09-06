import api from "../api"
import type { TYP_APIResponse } from "../types/types";
import { BaseAPIStore } from "./STO_Base";

export default class STO_Winners extends BaseAPIStore<TYP_APIResponse> {

    private constructor() {
        super();
    }
    static create(): STO_Winners {
        const store = new STO_Winners();
        store.init();
        return store;
    }
    async fetch() {
        const winners = await api.get(`/api/companies/winners/`);
        return winners.data.msg
    }

  };

  