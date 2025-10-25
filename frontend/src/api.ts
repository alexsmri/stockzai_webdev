import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("userStore:ActionLogin");
        if (token && typeof token === "string") {
            const parsedToken = JSON.parse(token)
            if (typeof parsedToken === "object" && "access" in parsedToken) {
                config.headers.Authorization = `Bearer ${parsedToken["access"]}`;
            }
        }
        if (import.meta.env.DEV) {
            const method = config.method?.toUpperCase() ?? "GET";
            console.debug(`[REQ] ${method} ${config.url}`);
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
