"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";

const asset = (name: string) => `/figma-assets/${name}`;

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

const initialMessages: ChatMessageData[] = [
  {
    id: "minsi-welcome",
    role: "minsi",
    lines: ["嗨，我在这里。", "你可以慢慢说，不用一次讲清楚。", "我会一直在，认真听你说。"],
    time: "10:30"
  },
  {
    id: "user-unclear",
    role: "user",
    lines: ["我不知道怎么讲。"],
    time: "10:31"
  },
  {
    id: "minsi-guide",
    role: "minsi",
    lines: ["没关系，说不清楚也没关系。", "我们可以从你更接近的感觉开始。", "你现在更倾向于哪一种呢?"],
    time: "10:30"
  },
  {
    id: "user-clarity",
    role: "user",
    lines: ["想先理清楚吧，脑子有点乱。"],
    time: "10:32"
  },
  {
    id: "minsi-followup",
    role: "minsi",
    lines: ["好的，我们一起来一点点理清。", "你现在脑子里，最乱的是什么?", "从最让你困扰的那一点说起也可以。"],
    time: "10:30"
  },
  {
    id: "minsi-typing",
    role: "typing",
    lines: ["..."]
  }
];

const emotionPrompts = ["有点低落", "有点紧张", "有点烦", "不知道怎么说", "想先理清楚"];

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
          {message.id === "minsi-welcome" ? <Image className="chat-bubble-heart" src={asset("heart.svg")} alt="" width={18} height={16} draggable={false} /> : null}
        </div>
        <time className="chat-message-meta">{message.time}</time>
      </div>
    </article>
  );
}

function EmotionChips({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="chat-emotion-chips" aria-label="陪伴提示">
      {emotionPrompts.map((prompt, index) => (
        <MinsiButton className="chat-emotion-chip" type="button" onClick={() => onSelect(prompt)} key={prompt}>
          <span aria-hidden="true">{["😟", "😰", "😠", "🙂", "🤔"][index]}</span>
          {prompt}
        </MinsiButton>
      ))}
    </div>
  );
}

function ChatComposer({
  value,
  onChange,
  onSubmit,
  onVoice
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoice: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="minsi-chat-input">
        输入当前聊天内容
      </label>
      <div className="chat-input-shell">
        <textarea
          id="minsi-chat-input"
          value={value}
          rows={1}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="说一点也可以，慢慢来..."
          aria-describedby="minsi-chat-privacy"
        />
        <MinsiButton className="chat-emoji-button" type="button" aria-label="选择情绪">
          <MoodIcon className="chat-input-icon" />
        </MinsiButton>
        <MinsiButton className="chat-send-button" type="submit" aria-label="发送当前消息">
          <SendIcon className="chat-send-icon" />
        </MinsiButton>
      </div>
      <MinsiButton className="chat-voice-switch" type="button" onClick={onVoice} aria-label="切换语音聊天">
        <MicIcon className="chat-voice-switch-icon" />
      </MinsiButton>
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

function EmergencyCard() {
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
      <MinsiButton className="chat-emergency-button" type="button">
        查看帮助资源
        <ExternalIcon className="chat-emergency-button-icon" />
      </MinsiButton>
    </GlassCard>
  );
}

function responseForPrompt(prompt: string) {
  if (prompt === "切换语音") {
    return "可以。现在先保持这次文字聊天不保存；想说出来时，我们也可以切换成语音陪伴。";
  }

  if (prompt === "情绪选择") {
    return "可以先不用解释原因。你可以从一个最接近的情绪开始，我会陪你慢慢整理。";
  }

  if (prompt === "我说不清楚" || prompt === "不知道怎么说") {
    return "说不清楚也没关系。你可以先说一个词、一个画面，或只说现在最明显的感觉。";
  }

  return "我听到了。我们不用急着把它讲完整，可以先从最靠近你的那一点开始。";
}

export function TextChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [draft, setDraft] = useState("");
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
  }, [messages]);

  function appendExchange(text: string) {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const minsiMessage = createMessage("minsi", responseForPrompt(trimmed));

    shouldScrollRef.current = true;
    setMessages((current) => [...current.filter((message) => message.role !== "typing"), userMessage, minsiMessage, { id: createMessageId("typing"), role: "typing", lines: ["..."] }]);
  }

  function handleSend() {
    appendExchange(draft);
    setDraft("");
  }

  function handleVoiceSwitch() {
    router.push("/chat/voice");
  }

  function handleShortcut(item: ShortcutItem) {
    if (item.kind === "voice") {
      handleVoiceSwitch();
      return;
    }

    appendExchange(item.title);
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
                {message.id === "minsi-guide" ? <EmotionChips onSelect={appendExchange} /> : null}
              </div>
            ))}
          </div>
          <ChatComposer value={draft} onChange={setDraft} onSubmit={handleSend} onVoice={handleVoiceSwitch} />
          <PrivacyLine />
        </GlassCard>

        <aside className="chat-sidebar" aria-label="陪伴提示与安全入口">
          <CompanionCard />
          <ShortcutCard onShortcut={handleShortcut} />
          <EmergencyCard />
        </aside>
      </div>
    </main>
  );
}
