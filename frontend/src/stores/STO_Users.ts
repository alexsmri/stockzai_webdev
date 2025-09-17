import { STO_Base } from "./STO_Base"
import api from "../api";

const ROUTE_CONFIG = {
  PropertyCredentials: "/api/users/credentials/",
  PropertyConsents: "/api/users/consents/",
  ActionVerification: "/api/users/verification/",
  ActionRegistrationCheck: "/api/users/register/check/",
  TokenVerificationRequest: "/api/users/verification/token/",
  TokenPasswordResetRequest: "/api/users/password-reset/token/",
  TokenPasswordResetValidation: "/api/users/password-reset/token/validate/",
  ActionPasswordReset: "/api/users/password-reset/",
  ActionRegistration: "/api/users/register/",
  ActionLogin: "/api/users/token/",
  ActionRefreshToken: "/api/users/token/refresh/",
  TokenLoginValidation: "/api/users/token/validate/",
  ActionEditProfile: "/api/users/edit/",
  ActionUnsubscribeNewsletter: "/api/users/unsubscribe-newsletter/",
  ActionSubscribeNewsletterRequest: "/api/users/subscribe-newsletter/token/",
  ActionSubscribeNewsletterVerify: "/api/users/subscribe-newsletter/verify/",
} as const;

const PERSISTED_KEYS: ValidKeys[] = [
    "ActionLogin",
    "PropertyCredentials",
    "ActionRefreshToken",
]

export type ValidKeys = keyof typeof ROUTE_CONFIG;

export default class STO_Users extends STO_Base {
    keys: ValidKeys[] = Object.keys(ROUTE_CONFIG) as ValidKeys[];
    routes = ROUTE_CONFIG;

    static async create(): Promise<STO_Users> {
        const store = new STO_Users();
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

    async get(key: ValidKeys): Promise<any> {
        try {
            this.status[key] = "loading"
            const value = await api.get(this.routes[key]);
            if (value.data.msg) {
                this.data[key] = value.data.msg
                this.persist(key)
                this.status[key] = "success"
                return this.data[key];
            } else {
                this.status[key] = "error"
                this.error[key] = value.data.error
                return false
            }
        } catch (error) {
            console.log(`Error: ${error}`)
            this.error[key] = error;
            this.status[key] = "error";
            return false
        } finally {
            this.notify(key);
        }
    }

    async post(key: ValidKeys, postData: any, returnData: boolean = false): Promise<any> {
        try {
            this.status[key] = "loading";
            const value = await api.post(this.routes[key], postData)
            if (value.data.msg) {
                this.data[key] = value.data.msg
                this.persist(key)
                this.status[key] = "success"
                return returnData ? value.data.msg : true
            } else {
                this.status[key] = "error"
                this.error[key] = value.data.error
                return false
            }
        } catch (error) {
            console.log(`Error: ${error}`)
            this.error[key] = error;
            this.status[key] = "error";
            return false
        } finally {
            this.notify(key);
        }
    }

    read(key: ValidKeys): any {
        this.data[key] = this.hydrate(key)
        return this.data[key];
    }
    update(key: ValidKeys, updateData: Record<any, any>): any {
        Object.keys(updateData).forEach((dataKey) => {
            this.data[key][dataKey] = updateData[dataKey];
        })
        this.persist(key);
        this.notify(key);
    }

    clear(key: ValidKeys): void {
        this.data[key] = {}
        this.persist(key)
    }

    persist(key: ValidKeys): void {
        if (PERSISTED_KEYS.includes(key)) {
            if (Object.keys(this.data[key]).length !== 0) {
                localStorage.setItem(`userStore:${key}`, JSON.stringify(this.data[key]))
            } else {
                localStorage.removeItem(`userStore:${key}`)
            }
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
