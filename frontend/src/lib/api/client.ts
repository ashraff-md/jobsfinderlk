import { getAccessToken, getRefreshToken, updateTokens } from "./auth";
import { API_URL } from "./config";

export { API_URL };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
  }
}

function isNetworkFailure(err: unknown): boolean {
  return (
    err instanceof TypeError &&
    (err.message === "Failed to fetch" || err.message.includes("NetworkError"))
  );
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = (await res.json().catch(() => null)) as {
      accessToken?: string;
      refreshToken?: string;
    } | null;
    if (!res.ok || !data?.accessToken || !data?.refreshToken) return false;
    updateTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request(
  path: string,
  options: RequestInit & { token?: string | null },
): Promise<Response> {
  const { token, headers, ...rest } = options;
  return fetch(`${API_URL}/api${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...rest } = options;
  const authenticated = "token" in options;
  let authToken = authenticated ? (token ?? getAccessToken()) : null;
  let res: Response;

  try {
    res = await request(path, { ...rest, token: authToken });
    if (res.status === 401 && authenticated) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        authToken = getAccessToken();
        res = await request(path, { ...rest, token: authToken });
      }
    }
  } catch (err) {
    if (isNetworkFailure(err)) {
      throw new ApiError(
        `Cannot reach the API at ${API_URL}. Start the backend with: cd backend && npm run start:dev`,
        0,
      );
    }
    throw err;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const rawMessage =
      (data as { message?: string | string[] })?.message ??
      `Request failed (${res.status})`;
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : String(rawMessage);
    if (res.status === 401 && authenticated) {
      throw new ApiError(
        "Your session has expired. Please sign in again as an employer.",
        401,
        data,
      );
    }
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}
