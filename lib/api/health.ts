import { apiFetch } from "./http";

export interface HealthResponse {
  status: "ok";
  service: string;
  timestamp: string;
}

export function getHealth() {
  return apiFetch<HealthResponse>("/api/health");
}
