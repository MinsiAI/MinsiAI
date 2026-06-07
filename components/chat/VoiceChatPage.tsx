"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";

const asset = (name: string) => `/figma-assets/${name}`;

type VoiceState = "idle" | "listening" | "paused" | "speaking";

interface VoiceStateCopy {
  label: string;
  title: string;
  helper: string;
  sideHelper: string;
}

const voiceStateCopy: Record<VoiceState, VoiceStateCopy> = {
  idle: {
    label: "准备好了，就慢慢说吧",
    title: "准备好了，就慢慢说吧",
    helper: "不用组织语言，想说什么都可以。",
    sideHelper: "准备好了，我会认真听。"
  },
  listening: {
    label: "正在聆听中…",
    title: "正在聆听中…",
    helper: "我在认真听你说",
    sideHelper: "我在认真听你说"
  },
  paused: {
    label: "已暂停聆听",
    title: "已暂停聆听",
    helper: "我会安静等你回来。",
    sideHelper: "暂停中，不会发起回应。"
  },
  speaking: {
    label: "Minsi 正在回应",
    title: "Minsi 正在回应",
    helper: "听听我的回应，准备好后可以继续说。",
    sideHelper: "Minsi 正在回应你。"
  }
};

type VoiceStageStyle = CSSProperties & {
  "--voice-audio-level": string;
};

function useVoiceAudioLevel(voiceState: VoiceState) {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    setAudioLevel(0);
    // Future Web Audio API integration can update this value from an analyser node.
    // This UI intentionally does not call getUserMedia or request microphone permission.
  }, [voiceState]);

  return audioLevel;
}

function MicIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8.25" y="3.5" width="7.5" height="11.1" rx="3.75" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.7 11.1a6.3 6.3 0 0 0 12.6 0M12 17.4v3.1M8.8 20.5h6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MutedMicIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4.2 4.2 15.6 15.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.25 9.2V7.25a3.75 3.75 0 0 1 6.9-2.05M15.75 9.8v1.15a3.76 3.76 0 0 1-4.7 3.64" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.7 11.1a6.3 6.3 0 0 0 9.58 5.37M18.3 11.1a6.28 6.28 0 0 1-.78 3.02M12 17.4v3.1M8.8 20.5h6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PauseIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.2 6.2v11.6M15.8 6.2v11.6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function PhoneOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5.3 15.2c3.95-3.15 9.45-3.15 13.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.6 13.8 5 16.4c-.35.35-.34.94.05 1.25l1.4 1.12c.34.27.83.26 1.15-.03l1.75-1.56M16.4 13.8l2.6 2.6c.35.35.34.94-.05 1.25l-1.4 1.12c-.34.27-.83.26-1.15-.03l-1.75-1.56" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MessageIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5.2 6.5A3.3 3.3 0 0 1 8.5 3.2h7A3.3 3.3 0 0 1 18.8 6.5v5.3a3.3 3.3 0 0 1-3.3 3.3H10l-4.1 4.1v-4.45a3.3 3.3 0 0 1-.7-2.03V6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.1 8.5h5.8M9.1 11.3h3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.4 18.8 6v5.25c0 4.2-2.7 7.5-6.8 8.75-4.1-1.25-6.8-4.55-6.8-8.75V6L12 3.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.65 12.05 2.15 2.1 4.55-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.8 9.15a3.6 3.6 0 0 1 7.2 0c0 2.9-3.1 3.36-3.1 6.05 0 1.45-.96 2.6-2.46 2.6-.95 0-1.75-.46-2.23-1.18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.55 8.9a6.85 6.85 0 0 1 13.7 0M8.4 12.6a2.45 2.45 0 0 1 2.4 2.58" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExternalIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.2 6.2h9.6v9.6M17.6 6.4 6.6 17.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VoiceStatusPill({ copy, state }: { copy: VoiceStateCopy; state: VoiceState }) {
  const isActive = state === "listening" || state === "speaking";

  return (
    <div className="voice-listening-pill" data-voice-state={state} aria-live="polite">
      <span className={isActive ? "voice-live-dot is-active" : "voice-live-dot"} />
      <span>{copy.label}</span>
    </div>
  );
}

function QuickStatusCard({ copy, state }: { copy: VoiceStateCopy; state: VoiceState }) {
  return (
    <GlassCard as="section" className="voice-side-card voice-quick-card" aria-label="当前状态">
      <h2>当前状态</h2>
      <div className="voice-quick-status">
        <div>
          <VoiceStatusPill copy={copy} state={state} />
          <p>{copy.sideHelper}</p>
        </div>
        <EarIcon className="voice-ear-icon" />
      </div>
    </GlassCard>
  );
}

function TipCard() {
  return (
    <GlassCard as="section" className="voice-side-card voice-tip-card" aria-label="小贴士">
      <div className="voice-side-heading">
        <h2>小贴士</h2>
        <span className="voice-tip-spark" aria-hidden="true">
          ✧
        </span>
      </div>
      <p>
        你可以慢慢说。
        <br />
        不用组织好语言。
        <br />
        我会认真听。
      </p>
      <Image className="voice-tip-image" src={asset("voice-tip-cloud.png")} alt="" width={168} height={112} draggable={false} />
    </GlassCard>
  );
}

function EmergencyCard() {
  return (
    <GlassCard as="aside" className="voice-side-card voice-emergency-card" id="voice-emergency-help" aria-labelledby="voice-emergency-title">
      <div className="voice-emergency-heading">
        <ShieldIcon className="voice-emergency-icon" />
        <h2 id="voice-emergency-title">紧急帮助</h2>
      </div>
      <p className="voice-emergency-copy">如果你正在经历危险，或有伤害自己/他人的想法，请及时联系可信任的大人或当地紧急服务。</p>
      <SafetyNotice
        variant="desktop"
        className="voice-emergency-note"
        text="Minsi 不是医生或心理治疗师；遇到危险时，请联系可信任的大人或专业机构。"
      />
      <MinsiButton className="voice-emergency-button" type="button">
        查看帮助资源
        <ExternalIcon className="voice-emergency-button-icon" />
      </MinsiButton>
    </GlassCard>
  );
}

export function VoiceChatPage() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [shouldAutoStart, setShouldAutoStart] = useState(true);
  const audioLevel = useVoiceAudioLevel(voiceState);
  const copy = voiceStateCopy[voiceState];
  const voiceStageStyle: VoiceStageStyle = { "--voice-audio-level": audioLevel.toFixed(2) };

  useEffect(() => {
    if (voiceState !== "idle" || !shouldAutoStart) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVoiceState("listening");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [voiceState, shouldAutoStart]);

  useEffect(() => {
    function handleMinsiAudioStart() {
      setVoiceState((current) => (current === "paused" ? current : "speaking"));
    }

    function handleMinsiAudioEnd() {
      setVoiceState((current) => (current === "speaking" ? "listening" : current));
    }

    // Future AI audio playback can dispatch these events when real audio starts/ends.
    window.addEventListener("minsi:voice-audio-start", handleMinsiAudioStart);
    window.addEventListener("minsi:voice-audio-end", handleMinsiAudioEnd);

    return () => {
      window.removeEventListener("minsi:voice-audio-start", handleMinsiAudioStart);
      window.removeEventListener("minsi:voice-audio-end", handleMinsiAudioEnd);
    };
  }, []);

  function handlePrimaryAction() {
    setIsMuted((current) => !current);
  }

  function handleListeningToggle() {
    if (voiceState === "paused" || voiceState === "idle") {
      setShouldAutoStart(true);
      setVoiceState("listening");
      return;
    }

    setShouldAutoStart(false);
    setVoiceState("paused");
  }

  function handleEndVoice() {
    setShouldAutoStart(false);
    setIsMuted(false);
    setVoiceState("idle");
  }

  const primaryControlLabel = isMuted ? "取消静音" : "静音";
  const listeningControlLabel = voiceState === "paused" ? "继续聆听" : voiceState === "idle" ? "开始聆听" : "暂停聆听";
  const listeningControlIcon =
    voiceState === "paused" || voiceState === "idle" ? <MicIcon className="voice-control-icon voice-control-icon-mic" /> : <PauseIcon className="voice-control-icon voice-control-icon-pause" />;

  return (
    <main className="voice-chat-page" data-voice-state={voiceState}>
      <SiteHeaderOverlay logoHref="/" />
      <div className="voice-desktop-shell">
        <SiteHeader variant="mobile" logoHref="/" />

        <div className="voice-main-panel" data-voice-state={voiceState}>
          <section className="voice-intro-copy" aria-label="语音聊天介绍">
            <h1>语音聊天</h1>
            <p>你可以慢慢说，我会认真听。</p>
          </section>

          <section className="voice-stage-area" data-voice-state={voiceState} style={voiceStageStyle} aria-labelledby="voice-status-title">
            <div className="voice-cloud-scene" data-voice-state={voiceState} aria-hidden="true">
              <Image className="voice-main-bg" src={asset("voice-main-bg.png")} alt="" width={944} height={952} priority draggable={false} />
              <Image className="voice-panel-cloud" src={asset("voice-panel-cloud.png")} alt="" width={457} height={399} priority draggable={false} />
              <Image className="voice-heart voice-heart-a" src={asset("heart.svg")} alt="" width={24} height={22} draggable={false} />
              <Image className="voice-heart voice-heart-b" src={asset("heart.svg")} alt="" width={18} height={16} draggable={false} />
              <Image className="voice-heart voice-heart-c" src={asset("heart.svg")} alt="" width={20} height={18} draggable={false} />
            </div>
            <div className="voice-center-copy">
              <h2 id="voice-status-title">{copy.title}</h2>
              <p>{copy.helper}</p>
            </div>
            <Image className="voice-wave-image" data-voice-state={voiceState} src={asset("voice-wave.svg")} alt="" width={474} height={60} draggable={false} />
            <VoiceStatusPill copy={copy} state={voiceState} />
          </section>

          <section className="voice-controls-zone" aria-label="语音控制">
            <MinsiButton className={isMuted ? "voice-control-button is-active" : "voice-control-button"} type="button" onClick={handlePrimaryAction} aria-label={primaryControlLabel}>
              {isMuted ? <MicIcon className="voice-control-icon voice-control-icon-mic" /> : <MutedMicIcon className="voice-control-icon voice-control-icon-muted" />}
              <span>{primaryControlLabel}</span>
            </MinsiButton>
            <MinsiButton className="voice-control-button" type="button" onClick={handleListeningToggle} aria-label={listeningControlLabel}>
              {listeningControlIcon}
              <span>{listeningControlLabel}</span>
            </MinsiButton>
            <MinsiButton className="voice-control-button voice-control-end" type="button" onClick={handleEndVoice}>
              <PhoneOffIcon className="voice-control-icon voice-control-icon-end" />
              <span>结束语音</span>
            </MinsiButton>
            <MinsiButton className="voice-control-button" href="/chat">
              <MessageIcon className="voice-control-icon voice-control-icon-message" />
              <span>切换文字</span>
            </MinsiButton>
          </section>

          <SafetyNotice
            variant="desktop"
            className="voice-panel-safety-note"
            text="语音不保存，退出清除；Minsi 不是医生或心理治疗师。"
          />

          <aside className="voice-sidebar" id="voice-mobile-status-panel" aria-label="语音聊天辅助信息">
            <QuickStatusCard copy={copy} state={voiceState} />
            <TipCard />
            <EmergencyCard />
          </aside>
        </div>
      </div>
    </main>
  );
}
