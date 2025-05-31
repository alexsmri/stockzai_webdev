export default abstract class BaseAPIStore<T> {
    
    private data: T | null = null;
    private subscribers: Set<() => void> = new Set();
    status: "idle" | "loading" | "error" | "success" = "idle"
    error: unknown | null = null

    protected constructor() {}

    protected abstract fetch(): Promise<T>

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

  