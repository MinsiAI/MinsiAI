import { apiFetch, setRuntimeApiBaseUrl } from "../api/http";

export const AUTH_SESSION_CHANGED_EVENT = "minsi-auth-session-changed";
const CURRENT_USER_CACHE_MS = 5_000;

export interface CurrentUser {
  authenticated: boolean;
  emailMasked: string | null;
  authProvider: string;
  providerLabel: string;
}

let cachedCurrentUser: { value: CurrentUser; expiresAt: number } | null = null;
let currentUserRequest: Promise<CurrentUser> | null = null;

function clearCurrentUserCache() {
  cachedCurrentUser = null;
  currentUserRequest = null;
}

export function notifyAuthSessionChanged() {
  clearCurrentUserCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const now = Date.now();
  if (cachedCurrentUser && cachedCurrentUser.expiresAt > now) {
    return cachedCurrentUser.value;
  }
  if (currentUserRequest) {
    return currentUserRequest;
  }

  const request = apiFetch<CurrentUser>("/api/me")
    .then((currentUser) => {
      cachedCurrentUser = {
        value: currentUser,
        expiresAt: Date.now() + CURRENT_USER_CACHE_MS
      };
      return currentUser;
    });
  currentUserRequest = request;
  try {
    return await request;
  } finally {
    if (currentUserRequest === request) {
      currentUserRequest = null;
    }
  }
}

export async function logoutCurrentSession(): Promise<void> {
  await apiFetch<unknown>("/api/auth/logout", {
    method: "POST"
  });
  clearCurrentUserCache();
  setRuntimeApiBaseUrl(null);
}
