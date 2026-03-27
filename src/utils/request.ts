import axios from "axios";

const request = axios.create({
    baseURL: "http://localhost:24352",
    timeout: 5000
});

request.interceptors.request.use(
    config => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

request.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        // token 失效处理
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default request;