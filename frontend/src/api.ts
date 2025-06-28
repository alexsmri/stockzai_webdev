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
        console.log(`[REQ] ${config.method?.toUpperCase()} ${config.url}`, config);
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
