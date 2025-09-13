// utils/apiService.ts
import axios, {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosError,
    AxiosResponse,
    AxiosRequestHeaders, // Add this import
  } from 'axios';
  import { clearCredentials } from '../store/authSlice';
  import type { Store } from 'redux';
  import type { RootState } from '../store/store';
  
  
  // API base URL
  const API_BASE_URL = 'https://api.tuma-app.com/api';
  
  // Create Axios instance
  const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    } as AxiosRequestHeaders, // Add type assertion here
  });
  
  // Store reference
  let store: Store<RootState> | undefined;
  
  // Inject Redux store once
  export const injectStore = (_store: Store<RootState>) => {
    store = _store;
  };
  
  // Request interceptor
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Initialize headers if they don't exist
      config.headers = config.headers || {} as AxiosRequestHeaders;
      
      if (store) {
        const token = store.getState()?.auth?.accessToken;
        if (token) {
          // Use type assertion for header assignment
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );
  
  // Response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 && store) {
        store.dispatch(clearCredentials());
      }
      return Promise.reject(error);
    }
  );
  
  export default api;