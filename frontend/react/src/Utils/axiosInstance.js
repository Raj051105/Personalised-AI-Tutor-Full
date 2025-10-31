import axios from "axios";
import { BASE_URL, RAG_URL } from "./api_path";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Separate axios instance for RAG (FastAPI) backend
export const axiosRag = axios.create({
    baseURL: RAG_URL,
    // LLM generation can take time (30s+), increase timeout to 2 minutes
    timeout: 120000,
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

// also export rag instance as named export
// usage: import axiosInstance, { axiosRag } from '../Utils/axiosInstance'