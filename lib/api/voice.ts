import { apiFetch } from "./http";

export interface VoiceSession {
  voiceToken: string;
  expiresInSeconds: number;
  realtimeClientSecret: string;
  realtimeClientSecretExpiresAt: number;
  realtimeModel: string;
}

export interface VoiceTranscribeResponse {
  text: string;
}

export function createVoiceSession(options: { realtime?: boolean } = {}) {
  const suffix = options.realtime === false ? "?realtime=false" : "";
  return apiFetch<VoiceSession>(`/api/voice/session${suffix}`, {
    method: "POST"
  });
}

export function transcribeVoiceSample(voiceToken: string, audioSample: string, mimeType = "application/mock-audio") {
  return apiFetch<VoiceTranscribeResponse>("/api/voice/transcribe", {
    method: "POST",
    body: JSON.stringify({ voiceToken, audioSample, mimeType })
  });
}

export function transcribeVoiceAudio(voiceToken: string, audio: Blob, filename = "voice-input.webm", signal?: AbortSignal) {
  const formData = new FormData();
  formData.set("voiceToken", voiceToken);
  formData.set("audio", audio, filename);

  return apiFetch<VoiceTranscribeResponse>("/api/voice/transcribe", {
    method: "POST",
    signal,
    body: formData
  });
}
