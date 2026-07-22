import { apiFetch } from "./http";

const PLACEHOLDER_CONTACT = "PLACEHOLDER_DO_NOT_DEPLOY";
const NEEDS_HUMAN_VERIFICATION = "NEEDS_HUMAN_VERIFICATION";

export interface SafetyResource {
  id: string;
  name: string;
  contact: string;
  available: string;
  disclaimer: string;
}

export function getSafetyResources(lang = "zh") {
  const searchParams = new URLSearchParams({ lang });
  return apiFetch<SafetyResource[]>(`/api/safety/resources?${searchParams.toString()}`);
}

export function isPlaceholderSafetyResource(resource: SafetyResource) {
  return resource.contact === PLACEHOLDER_CONTACT || resource.available === NEEDS_HUMAN_VERIFICATION;
}
