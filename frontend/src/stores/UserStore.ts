import { BaseStore } from "./BaseStores"
import api from "../api";

const ROUTE_CONFIG = {
  PropertyCredentials: "api/users/credentials/",
  ActionVerification: "api/users/verification/",
  TokenVerificationRequest: "api/users/verification/token/",
  TokenPasswordResetRequest: "api/users/password_reset/token/",
  TokenPasswordResetValidation: "api/users/password_reset/token/validate/",
  ActionPasswordReset: "/api/users/password_reset/",
  ActionRegistration: "/api/users/register/",
  ActionLogin: "/api/users/token/",
} as const;
// Needs to write some stuff in LocalStorage and read from there, needs nice logic for that
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
            const value = await this.fetch(key)
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
                this.notify(key)
                return true
            } else {
                return false
            }
        } catch (error) {
            return false
        }
    }
    read(key: ValidKeys): any {
        console.log(key)
        console.log(this.data[key])
        return this.data[key];
    }
}