"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ClipboardEvent, type DragEvent, type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { getSafetyResources, streamChatMessage, type ChatResponse, type SafetyResource } from "../../lib/api/chat";
import { ApiFetchError } from "../../lib/api/http";
import { pushProtectedRoute } from "../../lib/auth/protected-navigation";
import {
  CHAT_CONTEXT_MAX_TURNS,
  CHAT_INPUT_MAX_LENGTH,
  CHAT_INPUT_OVER_LIMIT_MESSAGE,
  CHAT_INPUT_WARNING_LENGTH,
  TEXT_CHAT_CONTEXT_MAX_LENGTH,
  MINSI_WELCOME_MESSAGE_ID,
  MINSI_WELCOME_MESSAGE_VARIANTS,
  getCharLength
} from "../../lib/chat/chat-config";
import type { ChatContextTurn } from "../../lib/chat/chat-types";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";

const asset = (name: string) => `/figma-assets/${name}`;
const VOICE_CHAT_PATH = "/chat/voice";

type ChatRole = "minsi" | "user" | "typing";

interface ChatMessageData {
  id: string;
  role: ChatRole;
  lines: string[];
  time?: string;
}

interface ShortcutItem {
  title: string;
  description: string;
  kind: "unclear" | "mood" | "voice";
}

const shortcuts: ShortcutItem[] = [
  {
    title: "我说不清楚",
    description: "不知道怎么说时点这里",
    kind: "unclear"
  },
  {
    title: "情绪选择",
    description: "通过情绪找到突破口",
    kind: "mood"
  },
  {
    title: "切换语音",
    description: "想说出来时，试试语音聊天",
    kind: "voice"
  }
];

function currentTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

function createMessageId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createWelcomeMessage(): ChatMessageData {
  return {
    id: MINSI_WELCOME_MESSAGE_ID,
    role: "minsi",
    lines: randomWelcomeMessageLines(),
    time: currentTime()
  };
}

function randomWelcomeMessageLines() {
  const index = Math.floor(Math.random() * MINSI_WELCOME_MESSAGE_VARIANTS.length);
  return MINSI_WELCOME_MESSAGE_VARIANTS[index] ?? MINSI_WELCOME_MESSAGE_VARIANTS[0];
}

function createMessage(role: Exclude<ChatRole, "typing">, text: string): ChatMessageData {
  return {
    id: createMessageId(role),
    role,
    lines: [text],
    time: currentTime()
  };
}

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8.2" y="3.5" width="7.6" height="11.2" rx="3.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.6v3.1M8.9 20.7h6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5.2" y="10.1" width="13.6" height="9.1" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.4 10.1V8a3.6 3.6 0 0 1 7.2 0v2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.4 18.8 6v5.2c0 4.2-2.7 7.5-6.8 8.8-4.1-1.3-6.8-4.6-6.8-8.8V6L12 3.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.6 12 2.2 2.1 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoodIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.4 10.2h.01M15.6 10.2h.01M8.7 14.2c1.9 1.7 4.7 1.7 6.6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WaterIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.4 14.8c2.1-2.1 4.5-2.1 6.6 0s4.5 2.1 6.6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.4 10.2c1.7-1.8 3.7-1.8 5.4 0s3.7 1.8 5.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 5.8c1-1 2.1-1 3.1 0s2.1 1 3.1 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 4 10.4 13.6M20 4l-5.6 16-4-6.4L4 9.6 20 4Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m4.5 10.2 3.2 3.1 7.8-7.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m7.5 4.5 5 5.5-5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 4h5v5M9.5 10.5 16 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessageAvatar() {
  return (
    <span className="chat-avatar" aria-hidden="true">
      <Image src={asset("logo-mark.png")} alt="" width={72} height={42} draggable={false} />
    </span>
  );
}

function ChatMessage({ message }: { message: ChatMessageData }) {
  if (message.role === "typing") {
    return (
      <div className="chat-message chat-message-minsi chat-message-typing">
        <MessageAvatar />
        <div className="chat-typing-bubble" aria-label="Minsi 正在回应">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <article className="chat-message chat-message-user">
        <div className="chat-bubble chat-bubble-user">
          {message.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="chat-message-meta chat-message-meta-user">
          <time>{message.time}</time>
          <CheckIcon className="chat-check-icon" />
        </div>
      </article>
    );
  }

  return (
    <article className="chat-message chat-message-minsi">
      <MessageAvatar />
      <div className="chat-message-body">
        <div className="chat-bubble chat-bubble-minsi">
          {message.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {message.id === MINSI_WELCOME_MESSAGE_ID ? <Image className="chat-bubble-heart" src={asset("heart.svg")} alt="" width={18} height={16} draggable={false} /> : null}
        </div>
        <time className="chat-message-meta">{message.time}</time>
      </div>
    </article>
  );
}

function ChatComposer({
  value,
  onChange,
  onSubmit,
  onVoice,
  disabled,
  isSending,
  isVoiceSwitching
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoice: () => void;
  disabled: boolean;
  isSending: boolean;
  isVoiceSwitching: boolean;
}) {
  const inputLength = getCharLength(value);
  const showCharacterCount = inputLength > CHAT_INPUT_WARNING_LENGTH;
  const isOverLimit = inputLength > CHAT_INPUT_MAX_LENGTH;
  const describedBy = [
    "minsi-chat-privacy",
    showCharacterCount ? "minsi-chat-character-count" : "",
    isOverLimit ? "minsi-chat-input-warning" : ""
  ]
    .filter(Boolean)
    .join(" ");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(event.clipboardData.items);
    const hasFileOrImage = items.some((item) => item.kind === "file" || item.type.startsWith("image/"));

    if (hasFileOrImage) {
      event.preventDefault();
    }
  }

  function handleDrop(event: DragEvent<HTMLTextAreaElement>) {
    if (event.dataTransfer.files.length > 0) {
      event.preventDefault();
    }
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="minsi-chat-input">
        输入当前聊天内容
      </label>
      <div className={`chat-input-shell${showCharacterCount ? " has-counter" : ""}${isOverLimit ? " is-over-limit" : ""}`}>
        <textarea
          id="minsi-chat-input"
          value={value}
          rows={1}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDrop={handleDrop}
          placeholder="说一点也可以，慢慢来..."
          aria-busy={isSending}
          aria-describedby={describedBy}
          aria-invalid={isOverLimit}
          autoComplete="off"
        />
        {showCharacterCount ? (
          <span className="chat-character-count" id="minsi-chat-character-count" aria-live="polite">
            {inputLength} / {CHAT_INPUT_MAX_LENGTH}
          </span>
        ) : null}
        <MinsiButton className="chat-send-button" type="submit" aria-label={isSending ? "正在发送" : "发送当前消息"} loading={isSending} disabled={disabled || !value.trim() || isOverLimit}>
          <SendIcon className="chat-send-icon" />
        </MinsiButton>
      </div>
      <MinsiButton className="chat-voice-switch" type="button" onClick={onVoice} aria-label={isVoiceSwitching ? "正在确认登录状态" : "切换语音聊天"} loading={isVoiceSwitching} disabled={disabled || isVoiceSwitching}>
        <MicIcon className="chat-voice-switch-icon" />
      </MinsiButton>
      {isOverLimit ? (
        <p className="chat-input-warning" id="minsi-chat-input-warning" role="status">
          {CHAT_INPUT_OVER_LIMIT_MESSAGE}
        </p>
      ) : null}
    </form>
  );
}

function PrivacyLine() {
  return (
    <p className="chat-privacy-line" id="minsi-chat-privacy">
      <LockIcon className="chat-privacy-lock" />
      <span>本次聊天不会保存，退出后自动删除。</span>
      <Image src={asset("heart.svg")} alt="" width={18} height={16} draggable={false} />
    </p>
  );
}

function CompanionCard() {
  return (
    <GlassCard as="section" className="chat-side-card chat-companion-card" id="chat-privacy-summary">
      <Image className="chat-companion-image" src={asset("chat-minsi-card.png")} alt="Minsi 陪伴形象" width={581} height={400} priority draggable={false} />
      <div className="chat-companion-title">
        <strong>Minsi</strong>
        <span>在这里</span>
      </div>
      <p>
        你可以慢慢说
        <br />
        不用一次讲清楚
        <Image src={asset("heart.svg")} alt="" width={16} height={14} draggable={false} />
      </p>
    </GlassCard>
  );
}

function ShortcutIcon({ kind }: { kind: ShortcutItem["kind"] }) {
  if (kind === "mood") {
    return <MoodIcon className="chat-shortcut-icon" />;
  }

  if (kind === "voice") {
    return <MicIcon className="chat-shortcut-icon" />;
  }

  return <WaterIcon className="chat-shortcut-icon" />;
}

function ShortcutCard({ onShortcut }: { onShortcut: (item: ShortcutItem) => void }) {
  return (
    <GlassCard as="section" className="chat-side-card chat-shortcut-card" aria-labelledby="chat-shortcuts-title">
      <h2 id="chat-shortcuts-title">快捷入口</h2>
      <div className="chat-shortcut-list">
        {shortcuts.map((item) => (
          <MinsiButton className="chat-shortcut-button" type="button" onClick={() => onShortcut(item)} key={item.title}>
            <span className="chat-shortcut-icon-shell">
              <ShortcutIcon kind={item.kind} />
            </span>
            <span className="chat-shortcut-copy">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
            <ArrowIcon className="chat-shortcut-arrow" />
          </MinsiButton>
        ))}
      </div>
    </GlassCard>
  );
}

type SafetyResourceStatus = "idle" | "loading" | "ready" | "error";

function EmergencyCard({
  status,
  resources,
  error,
  onLoad
}: {
  status: SafetyResourceStatus;
  resources: SafetyResource[];
  error: string;
  onLoad: () => void;
}) {
  return (
    <GlassCard as="aside" className="chat-side-card chat-emergency-card" id="chat-emergency-help" aria-labelledby="chat-emergency-title">
      <div className="chat-emergency-heading">
        <ShieldIcon className="chat-emergency-icon" />
        <h2 id="chat-emergency-title">紧急帮助</h2>
      </div>
      <p className="chat-emergency-copy">如果你正在经历危险，或有伤害自己/他人的想法，请及时联系可信任的大人或专业机构。</p>
      <SafetyNotice
        variant="desktop"
        className="chat-emergency-note"
        text="Minsi 不是医生或心理治疗师；遇到危险时，请联系可信任的大人或专业机构。"
      />
      <MinsiButton className="chat-emergency-button" type="button" onClick={onLoad} loading={status === "loading"} disabled={status === "loading"}>
        {status === "loading" ? "正在获取" : "查看帮助资源"}
        <ExternalIcon className="chat-emergency-button-icon" />
      </MinsiButton>
      {status === "ready" ? (
        <ul className="chat-emergency-resources" aria-live="polite">
          {resources.map((resource) => (
            <li key={resource.id}>
              <strong>{resource.name}</strong>
              <span>{resource.contact}</span>
              <small>{resource.disclaimer || resource.available}</small>
            </li>
          ))}
        </ul>
      ) : null}
      {status === "error" ? (
        <p className="chat-emergency-error" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </GlassCard>
  );
}

function ChatErrorNotice({ message, onRetry, canRetry }: { message: string; onRetry: () => void; canRetry: boolean }) {
  return (
    <div className="chat-error-notice" role="status" aria-live="polite">
      <p>{message}</p>
      {canRetry ? (
        <MinsiButton className="chat-retry-button" type="button" onClick={onRetry}>
          重试
        </MinsiButton>
      ) : null}
    </div>
  );
}

function formatReplyLines(response: ChatResponse) {
  return formatReplyText(response.reply);
}

function formatReplyText(reply: string) {
  const lines = reply
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [reply];
}

function chatErrorMessage(error: unknown) {
  if (error instanceof ApiFetchError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "请先登录后再继续聊天。";
    }

    if (error.code === "API_BASE_URL_MISSING") {
      return "后端地址还没有配置，暂时无法发送。";
    }

    return error.message || "连接暂时不太顺利，请稍后再试。";
  }

  return "连接暂时不太顺利，请稍后再试。";
}

function safetyResourceErrorMessage(error: unknown) {
  if (error instanceof ApiFetchError && error.code === "API_BASE_URL_MISSING") {
    return "后端地址还没有配置，暂时无法获取资源。";
  }

  return "暂时无法获取帮助资源，请稍后再试。";
}

function messageText(message: ChatMessageData) {
  return message.lines.join("\n").trim();
}

function buildRecentChatTurns(currentMessages: ChatMessageData[], currentUserTextToExclude = ""): ChatContextTurn[] {
  const contextMessages = currentMessages
    .filter((message) => (message.role === "user" || message.role === "minsi") && message.id !== MINSI_WELCOME_MESSAGE_ID)
    .filter((message) => messageText(message));

  if (currentUserTextToExclude) {
    const duplicateIndex = [...contextMessages].reverse().findIndex((message) => message.role === "user" && messageText(message) === currentUserTextToExclude);

    if (duplicateIndex >= 0) {
      contextMessages.splice(contextMessages.length - 1 - duplicateIndex, 1);
    }
  }

  const turns: ChatContextTurn[] = [];
  let usedLength = 0;

  for (const message of contextMessages.slice(-CHAT_CONTEXT_MAX_TURNS).reverse()) {
    const content = messageText(message);
    const contentLength = getCharLength(content);

    if (usedLength + contentLength > TEXT_CHAT_CONTEXT_MAX_LENGTH) {
      break;
    }

    turns.push({
      role: message.role === "user" ? "user" : "assistant",
      content
    });
    usedLength += contentLength;
  }

  return turns.reverse();
}

export function TextChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageData[]>(() => [createWelcomeMessage()]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStreamingReplyVisible, setIsStreamingReplyVisible] = useState(false);
  const [chatError, setChatError] = useState("");
  const [lastFailedText, setLastFailedText] = useState("");
  const [safetyResourcesStatus, setSafetyResourcesStatus] = useState<SafetyResourceStatus>("idle");
  const [safetyResources, setSafetyResources] = useState<SafetyResource[]>([]);
  const [safetyResourcesError, setSafetyResourcesError] = useState("");
  const [isVoiceSwitching, setIsVoiceSwitching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    if (!shouldScrollRef.current) {
      return;
    }

    const scrollNode = scrollRef.current;

    if (scrollNode) {
      scrollNode.scrollTop = scrollNode.scrollHeight;
    }

    shouldScrollRef.current = false;
  }, [messages, isSending, chatError]);

  async function submitChat(text: string, appendUserMessage = true) {
    const trimmed = text.trim();

    if (!trimmed || isSending) {
      return;
    }

    if (getCharLength(trimmed) > CHAT_INPUT_MAX_LENGTH) {
      setChatError(CHAT_INPUT_OVER_LIMIT_MESSAGE);
      setLastFailedText("");
      return;
    }

    const recentTurns = buildRecentChatTurns(messages, appendUserMessage ? "" : trimmed);

    shouldScrollRef.current = true;
    setChatError("");
    setLastFailedText("");

    if (appendUserMessage) {
      const userMessage = createMessage("user", trimmed);
      setMessages((current) => [...current.filter((message) => message.role !== "typing"), userMessage]);
    }

    setIsSending(true);
    setIsStreamingReplyVisible(false);
    const minsiMessageId = createMessageId("minsi");

    try {
      const response = await streamChatMessage(trimmed, recentTurns, {
        onDelta: (_delta, reply) => {
          const minsiMessage: ChatMessageData = {
            id: minsiMessageId,
            role: "minsi",
            lines: formatReplyText(reply),
            time: currentTime()
          };

          shouldScrollRef.current = true;
          setIsStreamingReplyVisible(true);
          setMessages((current) => {
            const existingIndex = current.findIndex((message) => message.id === minsiMessageId);
            if (existingIndex < 0) {
              return [...current.filter((message) => message.role !== "typing"), minsiMessage];
            }

            return current.map((message) => (message.id === minsiMessageId ? minsiMessage : message));
          });
        }
      });
      const minsiMessage: ChatMessageData = {
        id: minsiMessageId,
        role: "minsi",
        lines: formatReplyLines(response),
        time: currentTime()
      };

      shouldScrollRef.current = true;
      setMessages((current) => {
        const existingIndex = current.findIndex((message) => message.id === minsiMessageId);
        if (existingIndex < 0) {
          return [...current.filter((message) => message.role !== "typing"), minsiMessage];
        }

        return current.map((message) => (message.id === minsiMessageId ? minsiMessage : message));
      });

      if (response.safetyLevel === "crisis") {
        void loadSafetyResources();
      }
    } catch (error) {
      shouldScrollRef.current = true;
      setMessages((current) => current.filter((message) => message.id !== minsiMessageId));
      setChatError(chatErrorMessage(error));
      setLastFailedText(trimmed);
    } finally {
      setIsSending(false);
      setIsStreamingReplyVisible(false);
    }
  }

  function handleSend() {
    if (getCharLength(draft) > CHAT_INPUT_MAX_LENGTH) {
      return;
    }

    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    void submitChat(trimmed);
    setDraft("");
  }

  async function handleVoiceSwitch() {
    if (isVoiceSwitching) {
      return;
    }

    setIsVoiceSwitching(true);
    try {
      await pushProtectedRoute(router, VOICE_CHAT_PATH);
    } catch {
      setChatError("暂时无法确认登录状态，请稍后再试。");
      setLastFailedText("");
    } finally {
      setIsVoiceSwitching(false);
    }
  }

  function handleRetry() {
    if (!lastFailedText) {
      return;
    }

    void submitChat(lastFailedText, false);
  }

  function handleShortcut(item: ShortcutItem) {
    if (item.kind === "voice") {
      void handleVoiceSwitch();
      return;
    }

    void submitChat(item.title);
  }

  async function loadSafetyResources() {
    if (safetyResourcesStatus === "loading") {
      return;
    }

    setSafetyResourcesStatus("loading");
    setSafetyResourcesError("");

    try {
      const resources = await getSafetyResources("zh");
      setSafetyResources(resources);
      setSafetyResourcesStatus("ready");
    } catch (error) {
      setSafetyResourcesError(safetyResourceErrorMessage(error));
      setSafetyResourcesStatus("error");
    }
  }

  return (
    <main className="chat-page">
      <SiteHeaderOverlay logoHref="/" />
      <SiteHeader variant="mobile" logoHref="/" />

      <div className="chat-layout">
        <GlassCard as="section" className="chat-panel" aria-label="文字聊天">
          <div className="chat-message-scroll" ref={scrollRef} aria-live="polite">
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage message={message} />
              </div>
            ))}
            {isSending && !isStreamingReplyVisible ? (
              <ChatMessage
                message={{
                  id: "minsi-typing",
                  role: "typing",
                  lines: ["..."]
                }}
              />
            ) : null}
            {chatError ? <ChatErrorNotice message={chatError} onRetry={handleRetry} canRetry={Boolean(lastFailedText) && !isSending} /> : null}
          </div>
          <ChatComposer value={draft} onChange={setDraft} onSubmit={handleSend} onVoice={() => void handleVoiceSwitch()} disabled={isSending} isSending={isSending} isVoiceSwitching={isVoiceSwitching} />
          <PrivacyLine />
        </GlassCard>

        <aside className="chat-sidebar" aria-label="陪伴提示与安全入口">
          <CompanionCard />
          <ShortcutCard onShortcut={handleShortcut} />
          <EmergencyCard status={safetyResourcesStatus} resources={safetyResources} error={safetyResourcesError} onLoad={loadSafetyResources} />
        </aside>
      </div>
    </main>
  );
}
