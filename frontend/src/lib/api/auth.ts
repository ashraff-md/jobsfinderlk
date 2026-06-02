import { apiFetch } from "./client";
import type { AuthResponse, UserRole } from "./types";

const ACCESS_KEY = "jf_access_token";
const REFRESH_KEY = "jf_refresh_token";
const USER_KEY = "jf_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(data: AuthResponse) {
  localStorage.setItem(ACCESS_KEY, data.accessToken);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password: string) {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(data);
  return data;
}

export async function register(input: {
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
}) {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  saveSession(data);
  return data;
}

export function dashboardPath(role: UserRole) {
  if (role === "EMPLOYER") return "/employer";
  if (role === "ADMIN" || role === "MODERATOR") return "/admin";
  return "/dashboard";
}
