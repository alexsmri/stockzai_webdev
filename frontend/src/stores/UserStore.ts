import { BaseStore } from "./BaseStores"
import api from "../api";

const ROUTE_CONFIG = {
  PropertyCredentials: "api/users/credentials/",
  ActionVerification: "api/users/verification/",
  TokenVerificationRequest: "api/users/verification/token/",
  TokenPasswordResetRequest: "api/users/password-reset/token/",
  TokenPasswordResetValidation: "api/users/password-reset/token/validate/",
  ActionPasswordReset: "/api/users/password-reset/",
  ActionRegistration: "/api/users/register/",
  ActionLogin: "/api/users/token/",
  ActionRefreshToken: "/api/users/token/refresh/",
} as const;

const PERSISTED_KEYS: ValidKeys[] = [
    "ActionLogin",
    "PropertyCredentials",
    "ActionRefreshToken",
]

export type ValidKeys = keyof typeof ROUTE_CONFIG;

export default class UserStore extends BaseStore {
    keys: ValidKeys[] = Object.keys(ROUTE_CONFIG) as ValidKeys[];
    routes = ROUTE_CONFIG;

    static async create(): Promise<UserStore> {
        const store = new UserStore();
        for (const key of PERSISTED_KEYS) {
            const data = store.hydrate(key);
            if (data) {
                store.data[key] = data;
                store.notify(key)
            }
        }
        store.init();
        return store;
    }

    async fetch(key: ValidKeys): Promise<any> {
        const value = await api.get(this.routes[key]);
        return value
    }

    async get(key: ValidKeys): Promise<any> {
        try {
        this.status[key] = "loading"
        const value = await this.fetch(key)
        if (value instanceof Object) {
            this.data[key] = value.data.msg
            this.persist(key)
            this.status[key] = "success"
        } else {
            this.status[key] = "error"
            return false
        }
        } catch (error) {
            this.error[key] = error;
            this.status[key] = "error";
            return false
        } finally {
            this.notify(key);
        }
        return this.data[key]
    }

    async post(key: ValidKeys, postData: any): Promise<any> {
        try {
            this.status[key] = "loading";
            const value = await api.post(this.routes[key], postData)
            if (value instanceof Object) {
                this.data[key] = value.data.msg
                this.persist(key)
                this.status[key] = "success"
                return true
            } else {
                this.status[key] = "error"
                return false
            }
        } catch (error) {
            this.error[key] = error;
            this.status[key] = "error";
            return false
        } finally {
            this.notify(key);
        }
    }

    read(key: ValidKeys): any {
        console.log(key)
        console.log(this.data[key])
        return this.data[key];
    }

    persist(key: ValidKeys): void {
        if (PERSISTED_KEYS.includes(key)) {
            localStorage.setItem(`userStore:${key}`, JSON.stringify(this.data[key]))
        }
    }

    hydrate(key: ValidKeys): any | null {
        if (PERSISTED_KEYS.includes(key)) {
            const raw = localStorage.getItem(`userStore:${key}`);
            if (raw !== "undefined") {
                return raw ? JSON.parse(raw) : null;
            }
        }
        return null
    }
}