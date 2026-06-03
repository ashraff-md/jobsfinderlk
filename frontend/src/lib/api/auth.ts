import { apiFetch } from "./client";
import type { AuthResponse, UserRole } from "./types";

const ACCESS_KEY = "jf_access_token";
const REFRESH_KEY = "jf_refresh_token";
const USER_KEY = "jf_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function updateTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
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

export async function loginAdmin(email: string, password: string) {
  const data = await apiFetch<AuthResponse>("/auth/admin/login", {
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

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  adminProfile?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    contactNo?: string | null;
  } | null;
  employerUsers?: Array<{
    id: string;
    fullName?: string | null;
    title?: string | null;
    contactNo?: string | null;
    company: {
      id: string;
      name: string;
      description?: string | null;
      logoUrl?: string | null;
      verified: boolean;
    };
  }>;
};

export async function getProfile() {
  return apiFetch<UserProfile>("/auth/me", { token: getAccessToken() });
}

export async function updateEmployerProfile(input: {
  fullName?: string;
  title?: string;
  contactNo?: string;
}) {
  return apiFetch<{
    fullName?: string | null;
    title?: string | null;
    contactNo?: string | null;
  }>("/auth/employer-profile", {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(input),
  });
}

export async function updateAdminProfile(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNo?: string;
}) {
  return apiFetch<{
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    contactNo?: string | null;
  }>("/auth/admin-profile", {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify(input),
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/password", {
    method: "PATCH",
    token: getAccessToken(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function dashboardPath(role: UserRole) {
  if (role === "EMPLOYER") return "/employer";
  if (role === "ADMIN" || role === "MODERATOR") return "/admin";
  return "/dashboard";
}

export function portalProfilePath(role: UserRole) {
  if (role === "EMPLOYER") return "/employer/settings";
  if (role === "ADMIN" || role === "MODERATOR") return "/admin/settings";
  return "/dashboard/profile";
}
