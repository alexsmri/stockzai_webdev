import { BaseStore } from "./BaseStores"
import api from "../api";
import { json } from "node:stream/consumers";

const ROUTE_CONFIG = {
  ActionVerification: "api/users/verification/",
  TokenVerificationRequest: "api/users/verification/token",
  ActionRegistration: "/api/users/register/",
  ActionLogin: "/api/users/token/",
} as const;

export type ValidKeys = keyof typeof ROUTE_CONFIG;

export default class UserStore extends BaseStore {
    keys: ValidKeys[] = Object.keys(ROUTE_CONFIG) as ValidKeys[];
    routes = ROUTE_CONFIG;

    static async create(): Promise<UserStore> {
        const store = new UserStore();
        store.init();
        return store;
    }
    async fetch(key: ValidKeys): Promise<any> {
        const value = await api.get(this.routes[key]);
        return value
    }
    async get(key: ValidKeys): Promise<any> {
        if (!this.data[key]) {
            try {
            this.status[key] = "loading"
            const value = await this.fetch(key)     // Not unconditionally, might suck with POST routes
            this.data[key] = value
            this.status[key] = "success"
            } catch (error) {
                this.error[key] = error;
                this.status[key] = "error";
            }
            this.notify(key);
        }
        return this.data[key]
    }
    async post(key: ValidKeys, postData: any): Promise<any> {
        try {
            const value = await api.post(this.routes[key], postData)
            if (value instanceof Object) {
                this.data[key] = value.data.msg
            } else {
                throw Error("Something went wrong")
            }
        } catch (error) {
            return false
        }
    }
    read(key: ValidKeys): any {
        return this.data[key]
    }
}