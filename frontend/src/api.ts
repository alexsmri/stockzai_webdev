import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL
const api = axios.create({
  baseURL: baseUrl || null,
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
