import Cookies from "js-cookie";

export async function authFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = Cookies.get("accessToken");
  if (!token) throw new Error("No access token found.");

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

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Request failed: ${response.status} ${err}`);
  }

  // Try parsing JSON; fall back to empty object
  try {
    return await response.json();
  } catch {
    return {};
  }
}
