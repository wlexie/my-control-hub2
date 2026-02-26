import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosRequestHeaders,
} from "axios";
import { clearCredentials } from "../store/authSlice";
import type { Store } from "redux";
import type { RootState } from "../store/store";

// API base URL

//const API_BASE_URL = "https://auth.tuma-app.com/api";
const API_BASE_URL = "/api/auth";

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  } as AxiosRequestHeaders,
});

let store: Store<RootState> | undefined;

export const injectStores = (_store: Store<RootState>) => {
  store = _store;
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = (config.headers || {}) as AxiosRequestHeaders;

    if (store) {
      const { accessToken, tokenExpiry } = store.getState()?.auth;

      // Only attach token if it exists and is valid
      if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        (config.headers as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${accessToken}`;
      } else if (accessToken) {
        // Only clear/reject if there WAS a token but it expired. 
        // If no token exists at all (Login page), we let the request pass.
        store.dispatch(clearCredentials());
        // Optional: Reject here if you want to force logout on expired token, 
        // but for Login page we must return config.
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