import Cookies from "js-cookie";
import { store } from "@/store/store";
import { clearCredentials } from "@/store/authSlice";

export async function authFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = Cookies.get("accessToken");
  if (!token) {
    store.dispatch(clearCredentials());
    window.location.href = "/login";
    throw new Error("No access token found.");
  }

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

  if (response.status === 401) {
    // 🔑 Clear Redux state + cookies + redirect
    store.dispatch(clearCredentials());
    Cookies.remove("accessToken");
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
