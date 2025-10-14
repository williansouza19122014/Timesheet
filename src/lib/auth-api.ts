import { apiFetch } from "./api-client";

export type AuthRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  photo?: string | null;
  position?: string | null;
  department?: string | null;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(payload: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProfile() {
  return apiFetch<{ user: AuthUser }>("/api/auth/me");
}
