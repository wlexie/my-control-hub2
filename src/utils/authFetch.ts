// utils/authFetch.ts
import Cookies from "js-cookie";
import { store } from "@/store/store";
import { clearCredentials } from "@/store/authSlice";

function isTokenExpired(): boolean {
  const expiryStr = Cookies.get("accessTokenExpiry");
  if (!expiryStr) return false; // no expiry stored, assume valid until backend says otherwise
  const expiryTime = parseInt(expiryStr, 10);
  return Date.now() >= expiryTime;
}

export async function authFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = Cookies.get("accessToken");

  // No token
  if (!token) {
    store.dispatch(clearCredentials());
    window.location.href = "/login";
    throw new Error("No access token found.");
  }

  // Token expired (local check)
  if (isTokenExpired()) {
    store.dispatch(clearCredentials());
    Cookies.remove("accessToken");
    Cookies.remove("accessTokenExpiry");
    window.location.href = "/login";
    throw new Error("Session expired (local check). Redirecting to login...");
  }

  // Proceed with API call
  const headers = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`https://api.tuma-app.com/api${path}`, {
    ...options,
    headers,
  });

  // Fallback in case backend still returns 401
  if (response.status === 401) {
    store.dispatch(clearCredentials());
    Cookies.remove("accessToken");
    Cookies.remove("accessTokenExpiry");
    window.location.href = "/login";
    throw new Error("Session expired. Redirecting to login...");
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Request failed: ${response.status} ${err}`);
  }

  try {
    return await response.json();
  } catch {
    return {};
  }
}
