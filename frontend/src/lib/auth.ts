export type AuthUser = {
  user_id: number;
  nama: string;
  nim: string;
  email: string;
  role: string;
  total_poin?: number;
};

type AuthResponse = {
  message?: string;
  token?: string;
  user?: AuthUser;
};

export type StoredAuth = {
  token: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = "ecopoint_auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export async function authRequest<T extends AuthResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Request gagal");
  }

  return payload;
}

export function saveAuth(auth: StoredAuth) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event("ecopoint-auth-changed"));
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawAuth) {
    return null;
  }

  try {
    return JSON.parse(rawAuth) as StoredAuth;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("ecopoint-auth-changed"));
}
