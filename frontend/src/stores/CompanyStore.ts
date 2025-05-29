import api from "../api"

export default class CompanyStore {
    
    private data: JSON | null = null;
    private subscribers: Set<() => void> = new Set();
    status: "idle" | "loading" | "error" | "success" = "idle"
    error: unknown | null = null
    symbol: string

    constructor(symbol: string) {
        this.symbol = symbol
    }

    static async create(symbol: string): Promise<CompanyStore> {
        const store = new CompanyStore(symbol)
        await store.init();
        return store;
    }

    private async init() {
        this.status = "loading"
        const data = await this.fetch();
        if (data) {
            this.data = data;
            this.notify();
        }
    }

    getStatus() {
        return this.status;
    }

    getError() {
        return this.error;
    }

    async fetch() {
    try {
        const company = await api.get(`/api/companies/${this.symbol}/`);
        this.status = "success"
        return company.data
    } catch (error) {
        this.error = error
        this.status = "error"
        return null
    }
    }

    async get(subscriber: () => void) {
    this.subscribe(subscriber)
    return this.data
    }

    subscribe(subscriber: () => void) {
        this.subscribers.add(subscriber)
        return () => this.unsubscribe(subscriber);
    }

    unsubscribe(unsubscriber: () => void) {
        this.subscribers.delete(unsubscriber)
    }

    private notify() {
        this.subscribers.forEach(cb => cb())
    }

  };

  