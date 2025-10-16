import axios from "axios";
import { BASE_URL } from "./api_path";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Request headers:', config.headers);
        } else {
            console.warn('No token found in localStorage');
        }
        
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        config.headers['Accept'] = 'application/json';
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);


axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Response error:', error.response?.status, error.response?.data);
        
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;