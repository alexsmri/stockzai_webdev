export abstract class BaseAPIStore<T> {
    
    private data: T | null = null;
    private subscribers: Set<() => void> = new Set();
    status: "idle" | "loading" | "error" | "success" = "idle"
    error: unknown | null = null

    protected constructor() {}

    abstract fetch(): Promise<T>

    async init() {
        this.status = "loading"
        try {
        this.data = await this.fetch();
        this.status = "success"
        } catch (error) {
            this.status = "error"
            this.error = error
        } finally {
    
            this.notify();
        }
    }

    getStatus() {
        return this.status;
    }

    getError() {
        return this.error;
    }

    getData() {
        return this.data;
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

export abstract class BaseStore {
    private data: Record<string, Record<any, any>> = {};
    private subscribers: Record<string, Set<() => void>> = {};
    status: Record<string, "idle" | "loading" | "error" | "success"> = {}
    error: Record<string, unknown | null> = {}
    
    abstract keys: string[]
    abstract routes: Record<string, string>

    protected constructor() {}

    abstract fetch(key?: string | null): Promise<any>

    async init() {
        await Promise.all(this.keys.map(async (key) => {
             try {
                this.status[key] = "loading"
                this.data[key] = await this.fetch(key);
                this.status[key] = "success"
            } catch (error) {
                this.status[key] = "error"
                this.error[key] = error
        } finally {
            this.notify(key);
        }}));
    }

    getStatus() {
        return this.status;
    }

    getError() {
        return this.error;
    }

    getData() {
        return this.data;
    }

    async get(key: string) {
    return this.data[key]
    }

    update(key: string, updateData: Record<any, any>) {
        this.data[key] = updateData;
        this.notify(key);
    }   

    abstract post?(key: string, postData: any): any;

    subscribe(key: string, subscriber: () => void) {
        if (!this.subscribers[key]) this.subscribers[key] = new Set();
        this.subscribers[key].add(subscriber)
        return () => this.unsubscribe(key, subscriber);
    }

    unsubscribe(key: string, unsubscriber: () => void) {
        this.subscribers[key].delete(unsubscriber)
    }

    private notify(key: string) {
        this.subscribers[key]?.forEach(cb => cb());
    }

  };

  