import { apiFetch } from "./http";

export type ResearchFeedbackRating = "very" | "some" | "unsure";

export interface ResearchFeedbackSubmitPayload {
  rating: ResearchFeedbackRating;
  feedbackTypes: string[];
  feedbackText: string;
}

export interface ResearchFeedbackSubmitResponse {
  accepted: boolean;
  publiclyVisible: boolean;
}

export interface ApprovedResearchFeedback {
  feedbackText: string;
  feedbackType: string;
  rating: ResearchFeedbackRating;
  displayRegion: string;
}

export interface ResearchFeedbackMetrics {
  userCount: number;
  approvedFeedbackCount: number;
  coveredRegionCount: number;
  voluntaryPercent: number;
  regions: string[];
}

export function submitResearchFeedback(payload: ResearchFeedbackSubmitPayload) {
  return apiFetch<ResearchFeedbackSubmitResponse>("/api/research/feedback", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getApprovedResearchFeedback() {
  return apiFetch<ApprovedResearchFeedback[]>("/api/research/feedback");
}

export function getResearchFeedbackMetrics() {
  return apiFetch<ResearchFeedbackMetrics>("/api/research/feedback/metrics");
}
