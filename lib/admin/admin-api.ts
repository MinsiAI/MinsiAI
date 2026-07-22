import { apiFetch } from "../api/http";

export type AdminRole = "owner" | "moderator";
export type AdminResearchFeedbackStatus = "pending" | "approved" | "rejected";

export interface CurrentAdmin {
  authenticated: boolean;
  emailMasked: string;
  role: AdminRole;
}

export interface AdminResearchFeedbackListItem {
  id: number;
  rating: string;
  feedbackType: string | null;
  feedbackPreview: string;
  reviewStatus: AdminResearchFeedbackStatus;
  displayText: string | null;
  redactedText: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface AdminResearchFeedbackPage {
  items: AdminResearchFeedbackListItem[];
  page: number;
  limit: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AdminResearchFeedbackDetail {
  id: number;
  rating: string;
  feedbackType: string | null;
  feedbackText: string;
  reviewStatus: AdminResearchFeedbackStatus;
  displayText: string | null;
  redactedText: string | null;
  rejectionReasonCode: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface AdminResearchFeedbackUpdatePayload {
  reviewStatus?: AdminResearchFeedbackStatus;
  displayText?: string;
  redactedText?: string;
  rejectionReasonCode?: string;
}

const DEFAULT_ADMIN_REDIRECT = "/admin";

export async function sendAdminEmailCode(email: string): Promise<void> {
  await apiFetch<unknown>("/api/admin/auth/email/start", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function verifyAdminEmailCode(email: string, code: string): Promise<CurrentAdmin> {
  return apiFetch<CurrentAdmin>("/api/admin/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({ email, code })
  });
}

export async function getCurrentAdmin(): Promise<CurrentAdmin> {
  return apiFetch<CurrentAdmin>("/api/admin/me");
}

export async function logoutAdminSession(): Promise<void> {
  await apiFetch<unknown>("/api/admin/auth/logout", {
    method: "POST"
  });
}

export async function listAdminResearchFeedback(status: AdminResearchFeedbackStatus = "pending", page = 1, limit = 20): Promise<AdminResearchFeedbackPage> {
  const params = new URLSearchParams({ status, page: String(page), limit: String(limit) });
  return apiFetch<AdminResearchFeedbackPage>(`/api/admin/research-feedback?${params.toString()}`);
}

export async function getAdminResearchFeedback(id: number): Promise<AdminResearchFeedbackDetail> {
  return apiFetch<AdminResearchFeedbackDetail>(`/api/admin/research-feedback/${id}`);
}

export async function updateAdminResearchFeedback(id: number, payload: AdminResearchFeedbackUpdatePayload): Promise<AdminResearchFeedbackDetail> {
  return apiFetch<AdminResearchFeedbackDetail>(`/api/admin/research-feedback/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function resolveSafeAdminRedirect(rawRedirect: string | null | undefined) {
  if (!rawRedirect) {
    return DEFAULT_ADMIN_REDIRECT;
  }

  const redirect = rawRedirect.trim();
  if (!redirect.startsWith("/admin") || redirect.startsWith("//") || redirect.startsWith("/\\")) {
    return DEFAULT_ADMIN_REDIRECT;
  }

  try {
    const parsed = new URL(redirect, "https://minsi.ai");
    if (parsed.origin !== "https://minsi.ai" || !parsed.pathname.startsWith("/admin")) {
      return DEFAULT_ADMIN_REDIRECT;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || DEFAULT_ADMIN_REDIRECT;
  } catch {
    return DEFAULT_ADMIN_REDIRECT;
  }
}
