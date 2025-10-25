import api from "../api";

export type StoreStatus = "idle" | "loading" | "error" | "success";

export abstract class STO_Base<TValidKey extends string> {
    data: Partial<Record<TValidKey, unknown>> = {};
    protected subscribers: Partial<Record<TValidKey, Set<() => void>>> = {};
    status: Partial<Record<TValidKey, StoreStatus>> = {};
    error: Partial<Record<TValidKey, unknown | null>> = {};

    abstract keys: TValidKey[];
    abstract routes: Record<TValidKey, string>;

    private storagePrefix: string;
    private persistedKeys: Set<TValidKey>;

    protected constructor(options?: { storagePrefix?: string; persistedKeys?: TValidKey[] }) {
        this.storagePrefix = options?.storagePrefix ?? "store";
        this.persistedKeys = new Set(options?.persistedKeys ?? []);
    }

    protected ensureAllKeysInitialized(): void {
        this.keys.forEach((key) => this.ensureKeyInitialized(key));
    }

    protected ensureKeyInitialized(key: TValidKey): void {
        if (!this.status[key]) {
            this.status[key] = "idle";
        }
        if (!(key in this.error)) {
            this.error[key] = null;
        }
        if (!(key in this.data)) {
            const hydrated = this.shouldPersist(key) ? this.hydrate(key) : undefined;
            this.data[key] = hydrated ?? null;
        }
        if (!this.subscribers[key]) {
            this.subscribers[key] = new Set();
        }
    }

    protected buildUrl(
        baseRoute: string,
        prUrlPaths: (string | number)[] = [],
        prUrlParams?: Record<string, unknown>,
    ): string {
        const normalizedBase = baseRoute.replace(/\/+$/u, "");
        const encodedPaths = prUrlPaths.length
            ? "/" + prUrlPaths.map((segment) => encodeURIComponent(String(segment))).join("/")
            : "";
        const resolved = `${normalizedBase}${encodedPaths}/`;
        const queryString = this.buildQueryString(prUrlParams);
        return queryString ? `${resolved}?${queryString}` : resolved;
    }

    private buildQueryString(prUrlParams?: Record<string, unknown>): string {
        if (!prUrlParams) return "";
        const urlParams = new URLSearchParams();
        Object.entries(prUrlParams).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (Array.isArray(value)) {
                value.forEach((item) => urlParams.append(key, String(item)));
            } else {
                urlParams.set(key, String(value));
            }
        });
        return urlParams.toString();
    }

    protected shouldPersist(key: TValidKey): boolean {
        return this.persistedKeys.has(key);
    }

    protected getStorageKey(key: TValidKey): string {
        return `${this.storagePrefix}:${key}`;
    }

    protected persist(key: TValidKey): void {
        if (!this.shouldPersist(key)) return;
        try {
            const content = this.data[key];
            if (content && Object.keys(content).length > 0) {
                localStorage.setItem(this.getStorageKey(key), JSON.stringify(content));
            } else {
                localStorage.removeItem(this.getStorageKey(key));
            }
        } catch (error) {
            console.warn(`Failed to persist key ${key}`, error);
        }
    }

    protected hydrate(key: TValidKey): unknown | null {
        if (!this.shouldPersist(key)) return null;
        const raw = localStorage.getItem(this.getStorageKey(key));
        if (!raw || raw === "undefined") {
            return null;
        }
        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn(`Failed to hydrate key ${key}`, error);
            return null;
        }
    }

    async get(
        key: TValidKey,
        prUrlPaths: (string | number)[] = [],
        prUrlParams: Record<string, unknown> = {},
    ): Promise<unknown> {
        this.ensureKeyInitialized(key);
        try {
            this.status[key] = "loading";
            const url = this.buildUrl(this.routes[key], prUrlPaths, prUrlParams);
            const response = await api.get(url);
            if (response?.data?.msg !== undefined) {
                this.data[key] = response.data.msg;
                this.persist(key);
                this.status[key] = "success";
                this.error[key] = null;
                return this.data[key];
            }
            this.status[key] = "error";
            this.error[key] = response?.data?.error ?? "Unexpected response format";
            return false;
        } catch (error) {
            this.error[key] = error;
            this.status[key] = "error";
            return false;
        } finally {
            this.notify(key);
        }
    }

    async post(
        key: TValidKey,
        postData: any,
        returnData = false,
        prUrlPaths: (string | number)[] = [],
        prUrlParams: Record<string, unknown> = {},
    ): Promise<unknown> {
        this.ensureKeyInitialized(key);
        try {
            this.status[key] = "loading";
            const url = this.buildUrl(this.routes[key], prUrlPaths, prUrlParams);
            const response = await api.post(url, postData);
            if (response?.data?.msg !== undefined) {
                const message = response.data.msg;
                const errorMessage = response?.data?.error;
                this.data[key] = message;
                this.persist(key);
                if (errorMessage) {
                    this.status[key] = "error";
                    this.error[key] = errorMessage;
                } else {
                    this.status[key] = "success";
                    this.error[key] = null;
                }
                if (returnData) {
                    return message;
                }
                return errorMessage ? false : message;
            }
            this.status[key] = "error";
            this.error[key] = response?.data?.error ?? "Unexpected response format";
            return false;
        } catch (error: unknown) {
            const maybeResponse = (error as { response?: { data?: { error?: unknown } } }).response;
            const responseError = maybeResponse?.data?.error;
            this.error[key] = responseError ?? (error instanceof Error ? error.message : error);
            this.status[key] = "error";
            return false;
        } finally {
            this.notify(key);
        }
    }

    read(key: TValidKey): unknown {
        this.ensureKeyInitialized(key);
        return this.data[key];
    }

    getError(key: TValidKey): unknown {
        this.ensureKeyInitialized(key);
        return this.error[key];
    }

    getStatus(key: TValidKey): unknown {
        this.ensureKeyInitialized(key);
        return this.status[key];
    }

    update(key: TValidKey, updateData: Record<string, unknown>): Record<string, unknown> {
        this.ensureKeyInitialized(key);
        const current = (this.data[key] ?? {}) as Record<string, unknown>;
        Object.keys(updateData).forEach((field) => {
            current[field] = updateData[field];
        });
        this.data[key] = current;
        this.persist(key);
        this.notify(key);
        return this.data[key] as Record<string, unknown>;
    }

    set(key: TValidKey, setData: any): any {
        this.ensureKeyInitialized(key);
        this.data[key] = setData;
        this.persist(key);
        this.notify(key);
        return this.data[key];
    }

    clear(key: TValidKey): void {
        this.ensureKeyInitialized(key);
        this.data[key] = {};
        this.persist(key);
        this.status[key] = "idle";
        this.error[key] = null;
        this.notify(key);
    }

    subscribe(key: TValidKey, subscriber: () => void) {
        this.ensureKeyInitialized(key);
        this.subscribers[key]?.add(subscriber);
        return () => this.unsubscribe(key, subscriber);
    }

    unsubscribe(key: TValidKey, unsubscriber: () => void) {
        this.subscribers[key]?.delete(unsubscriber);
    }

    protected notify(key: TValidKey) {
        this.subscribers[key]?.forEach((callback) => callback());
    }
}
