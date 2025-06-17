import { BaseStore } from "./BaseStores"
import api from "../api";

const ROUTE_CONFIG = {
  TokenVerification: "api/users/verification/token/validate",
  TokenPasswordReset: "test/",
  ActionVerification: "test/",
} as const;

export type ValidKeys = keyof typeof ROUTE_CONFIG;

export default class UserStore extends BaseStore {
    keys: ValidKeys[] = Object.keys(ROUTE_CONFIG) as ValidKeys[];
    routes = ROUTE_CONFIG;

    static async create(): Promise<UserStore> {
        const store = new UserStore();
        await store.init();
        return store;
    }
    async fetch(key: ValidKeys): Promise<any> {
        const value = await api.get(this.routes[key]);
        return value
    }
    async post(key: ValidKeys, postData: any): Promise<any> {
        try {
            const value = await api.post(this.routes[key], postData)
            return value
        } catch (error) {
            return false
        }
    }
}