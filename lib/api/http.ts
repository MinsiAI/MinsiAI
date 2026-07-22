export interface ApiErrorBody {
  code: string;
  message: string;
}

export type ApiEnvelope<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ApiErrorBody;
    };

export class ApiFetchError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiFetchError";
    this.status = status;
    this.code = code;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
let runtimeApiBaseUrl: string | null = null;

export function setRuntimeApiBaseUrl(apiBaseUrl: string | null) {
  if (!apiBaseUrl) {
    runtimeApiBaseUrl = null;
    return;
  }

  try {
    const parsedUrl = new URL(apiBaseUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      runtimeApiBaseUrl = null;
      return;
    }

    runtimeApiBaseUrl = parsedUrl.origin.replace(/\/+$/, "");
  } catch {
    runtimeApiBaseUrl = null;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetchRaw(path, init);
  const payload = await readPayload<T>(response);

  if (isApiEnvelope<T>(payload)) {
    if (!payload.ok) {
      throw new ApiFetchError(response.status, payload.error.code, payload.error.message);
    }

    return payload.data;
  }

  return payload as T;
}

export async function apiFetchRaw(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: init.credentials ?? "include",
    headers: buildHeaders(init)
  });

  if (!response.ok) {
    const payload = await readPayload<unknown>(response);
    throw toApiError(response.status, payload);
  }

  return response;
}

export function getApiOrigin() {
  const apiBaseUrl = resolveApiBaseUrl();
  if (!apiBaseUrl) {
    return "";
  }

  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return "";
  }
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const apiBaseUrl = resolveApiBaseUrl();
  if (!apiBaseUrl) {
    throw new ApiFetchError(0, "API_BASE_URL_MISSING", "NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

function resolveApiBaseUrl() {
  if (runtimeApiBaseUrl) {
    return runtimeApiBaseUrl;
  }

  if (!API_BASE_URL) {
    return "";
  }

  if (typeof window === "undefined") {
    return API_BASE_URL;
  }

  try {
    const configuredUrl = new URL(API_BASE_URL);
    const pageHostname = window.location.hostname;

    if (isLocalDevHost(configuredUrl.hostname) && isLocalDevHost(pageHostname)) {
      if (isLoopbackHost(configuredUrl.hostname) && isLoopbackHost(pageHostname)) {
        return API_BASE_URL;
      }

      configuredUrl.hostname = pageHostname;
      return configuredUrl.toString().replace(/\/+$/, "");
    }
  } catch {
    return API_BASE_URL;
  }

  return API_BASE_URL;
}

function isLocalDevHost(hostname: string) {
  return hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname.startsWith("192.168.")
    || hostname.startsWith("10.")
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

function isLoopbackHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function buildHeaders(init: RequestInit) {
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  return headers;
}

async function readPayload<T>(response: Response): Promise<T | ApiEnvelope<T> | null> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as T | ApiEnvelope<T>;
}

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return Boolean(payload && typeof payload === "object" && "ok" in payload);
}

function toApiError(status: number, payload: unknown) {
  if (isApiEnvelope<unknown>(payload) && !payload.ok) {
    return new ApiFetchError(status, payload.error.code, payload.error.message);
  }

  return new ApiFetchError(status, "HTTP_ERROR", "Request failed.");
}
