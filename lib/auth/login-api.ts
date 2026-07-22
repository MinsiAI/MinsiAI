import { notifyAuthSessionChanged } from "./session-api";

export type QRProvider = "wechat" | "qq";
export type OAuthStartClient = "desktop" | "mobile";

export interface QRCodeResponse {
  authorizeUrl: string;
  expiresInSeconds: number;
  state: string;
  qrUrl?: string | null;
}

export interface LoginActionResponse {
  ok: boolean;
}

export interface OAuthCompleteResponse {
  redirect: string;
}

export interface OAuthStatusResponse {
  status: "pending" | "success";
  redirect?: string;
}

const DEFAULT_REDIRECT_PATH = "/chat";

export async function requestQrCode(provider: QRProvider, redirect?: string | null, client: OAuthStartClient = "desktop"): Promise<QRCodeResponse> {
  const { apiFetch } = await import("../api/http");
  return apiFetch<QRCodeResponse>("/api/auth/oauth/start", {
    method: "POST",
    body: JSON.stringify({
      provider,
      redirect: resolveSafeRedirectPath(redirect),
      client,
      origin: getCurrentOrigin()
    })
  });
}

export async function completeOAuthLogin(provider: QRProvider, code: string, state: string): Promise<OAuthCompleteResponse> {
  const { apiFetch } = await import("../api/http");
  return apiFetch<OAuthCompleteResponse>("/api/auth/oauth/complete", {
    method: "POST",
    body: JSON.stringify({ provider, code, state })
  });
}

export async function checkOAuthLoginStatus(provider: QRProvider, state: string): Promise<OAuthStatusResponse> {
  const { apiFetch } = await import("../api/http");
  const params = new URLSearchParams({ provider, state });
  return apiFetch<OAuthStatusResponse>(`/api/auth/oauth/status?${params.toString()}`);
}

export async function sendEmailCode(email: string): Promise<LoginActionResponse> {
  await apiAuthRequest("/api/auth/email/start", { email });

  return { ok: true };
}

export async function loginWithEmailCode(email: string, code: string): Promise<LoginActionResponse> {
  await apiAuthRequest("/api/auth/email/verify", { email, code });
  notifyAuthSessionChanged();

  return { ok: true };
}

export function resolveSafeRedirectPath(rawRedirect: string | null | undefined) {
  if (!rawRedirect) {
    return DEFAULT_REDIRECT_PATH;
  }

  const redirect = rawRedirect.trim();
  if (!redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/\\")) {
    return DEFAULT_REDIRECT_PATH;
  }

  try {
    const parsed = new URL(redirect, "https://minsi.ai");
    if (parsed.origin !== "https://minsi.ai") {
      return DEFAULT_REDIRECT_PATH;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}` || DEFAULT_REDIRECT_PATH;
  } catch {
    return DEFAULT_REDIRECT_PATH;
  }
}

async function apiAuthRequest(path: string, body: Record<string, string>) {
  const { apiFetch } = await import("../api/http");
  await apiFetch<unknown>(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

function getCurrentOrigin() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location.origin;
}
