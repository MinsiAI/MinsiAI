import { ApiFetchError, apiFetch, apiFetchRaw } from "./http";
import type { ChatContextTurn } from "../chat/chat-types";

export { getSafetyResources } from "./safety";
export type { SafetyResource } from "./safety";

export type SafetyLevel = "normal" | "elevated" | "crisis";

export interface ChatResponse {
  reply: string;
  safetyLevel: SafetyLevel;
  suggestedActions: string[];
  replyAudioContentType?: string;
  replyAudioBase64?: string;
}

interface SendChatMessageOptions {
  includeAudio?: boolean;
  signal?: AbortSignal;
}

interface StreamChatMessageOptions {
  signal?: AbortSignal;
  onDelta: (delta: string, reply: string) => void;
}

export function sendChatMessage(message: string, recentTurns: ChatContextTurn[] = [], options: SendChatMessageOptions = {}) {
  return apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    signal: options.signal,
    body: JSON.stringify({ message, recentTurns, includeAudio: options.includeAudio === true })
  });
}

export async function streamChatMessage(
  message: string,
  recentTurns: ChatContextTurn[] = [],
  options: StreamChatMessageOptions
): Promise<ChatResponse> {
  const response = await apiFetchRaw("/api/chat", {
    method: "POST",
    signal: options.signal,
    headers: {
      Accept: "text/event-stream"
    },
    body: JSON.stringify({ message, recentTurns, includeAudio: false })
  });

  if (!response.body) {
    throw new ApiFetchError(0, "STREAM_UNAVAILABLE", "连接暂时不太顺利，请稍后再试。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let reply = "";
  let safetyLevel: SafetyLevel = "normal";
  let suggestedActions: string[] = [];
  let completed = false;

  function processFrame(frame: string) {
    let event = "message";
    const dataLines: string[] = [];

    for (const line of frame.split("\n")) {
      if (line.startsWith("event:")) {
        event = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
      }
    }

    if (dataLines.length === 0) {
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(dataLines.join("\n"));
    } catch {
      throw new ApiFetchError(0, "STREAM_INVALID", "连接暂时不太顺利，请稍后再试。");
    }

    if (event === "delta") {
      const delta = readStringField(payload, "text");
      if (delta) {
        reply += delta;
        options.onDelta(delta, reply);
      }
      return;
    }

    if (event === "done") {
      const receivedSafetyLevel = readStringField(payload, "safetyLevel");
      if (receivedSafetyLevel === "normal" || receivedSafetyLevel === "elevated" || receivedSafetyLevel === "crisis") {
        safetyLevel = receivedSafetyLevel;
      }
      suggestedActions = readStringArrayField(payload, "suggestedActions");
      completed = true;
      return;
    }

    if (event === "error") {
      throw new ApiFetchError(
        500,
        readStringField(payload, "code") || "INTERNAL_ERROR",
        readStringField(payload, "message") || "连接暂时不太顺利，请稍后再试。"
      );
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      buffer = buffer.replace(/\r\n/g, "\n");

      let frameEnd = buffer.indexOf("\n\n");
      while (frameEnd >= 0) {
        const frame = buffer.slice(0, frameEnd);
        buffer = buffer.slice(frameEnd + 2);
        processFrame(frame);
        frameEnd = buffer.indexOf("\n\n");
      }

      if (done) {
        if (buffer.trim()) {
          processFrame(buffer);
        }
        break;
      }
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }

  if (!completed || !reply.trim()) {
    throw new ApiFetchError(0, "STREAM_INCOMPLETE", "连接中断了，请重试一次。");
  }

  return {
    reply: reply.trim(),
    safetyLevel,
    suggestedActions
  };
}

function readStringField(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function readStringArrayField(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const value = (payload as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
