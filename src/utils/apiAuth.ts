// utils/apiAuth.ts
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
  const API_BASE_URL = 'https://auth.tuma-app.com/api';
  
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
  export const injectStores = (_store: Store<RootState>) => {
    store = _store;
  };
  
 // request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers = config.headers || {} as AxiosRequestHeaders;
  
      if (store) {
        const { accessToken, tokenExpiry } = store.getState()?.auth;
        //console.log('Access Token:', accessToken); 
        console.log('Token Expiry:', tokenExpiry);
        
        // Check if token exists and isn't expired
        if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
        } else {
          // Handle token refresh or redirect to login
          if (store) {
            store.dispatch(clearCredentials());
          }
          return Promise.reject(new Error('Token expired or missing'));
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