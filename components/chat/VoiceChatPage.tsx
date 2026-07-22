"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSafetyResources, sendChatMessage, type SafetyResource } from "../../lib/api/chat";
import { ApiFetchError } from "../../lib/api/http";
import { createVoiceSession, transcribeVoiceAudio, type VoiceSession } from "../../lib/api/voice";
import { CHAT_CONTEXT_MAX_TURNS, getCharLength, VOICE_CHAT_CONTEXT_MAX_LENGTH } from "../../lib/chat/chat-config";
import type { ChatContextTurn } from "../../lib/chat/chat-types";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";

const asset = (name: string) => `/figma-assets/${name}`;
const VOICE_SECURE_CONTEXT_ERROR = "VOICE_REQUIRES_SECURE_CONTEXT";
const MAX_VOICE_SESSION_SECONDS = 30 * 60;
const WAVE_BAND_COUNT = 32;
const WAVE_BARS = Array.from({ length: WAVE_BAND_COUNT }, (_, index) => index);
const IDLE_WAVE_BANDS = WAVE_BARS.map((index) => {
  const center = 1 - Math.abs(index - (WAVE_BAND_COUNT - 1) / 2) / ((WAVE_BAND_COUNT - 1) / 2);
  return 0.14 + center * 0.42 + (index % 4) * 0.025;
});
const SPEECH_LEVEL_THRESHOLD = 0.032;
const MIN_TURN_RECORDING_MS = 700;
const MIN_DETECTED_SPEECH_MS = 450;
const MIN_RECORDED_AUDIO_BYTES = 3500;
const END_OF_SPEECH_SILENCE_MS = 700;
const MAX_TURN_RECORDING_MS = 24000;
const VOICE_REQUEST_TIMEOUT_MS = 35000;
const REALTIME_CONNECT_TIMEOUT_MS = 12000;
const RESPONSE_PENDING_INDICATOR_DELAY_MS = 650;
const REALTIME_CALLS_ENDPOINT = process.env.NODE_ENV === "development"
  ? "/openai/realtime/calls"
  : "https://api.openai.com/v1/realtime/calls";
const REALTIME_OPENINGS = [
  {
    id: "gentle-arrival",
    cue: "像刚接通年轻朋友的语音，带一点笑意说对方来啦，再告诉对方不用准备、想到哪儿就说到哪儿。"
  },
  {
    id: "time-for-you",
    cue: "从这一会儿不用赶时间切入，轻松告诉对方开心的、烦的或普通小事都能聊。"
  },
  {
    id: "no-perfect-words",
    cue: "承认刚开场可能不知道说什么，用很日常的口吻告诉对方想到哪儿就说到哪儿。"
  },
  {
    id: "follow-your-pace",
    cue: "先轻轻打招呼，再说不用把话讲得很完整，会自然跟上对方的节奏。"
  },
  {
    id: "start-anywhere",
    cue: "像年轻朋友见面一样问候，说今天想吐槽、想分享，或者只聊一件小事都可以。"
  },
  {
    id: "no-rush",
    cue: "用稍微轻快但不撒娇的上线招呼开场，说认真聊或随口说几句都可以。"
  },
  {
    id: "soft-company",
    cue: "用见到你啦的感觉自然开场，把声音放轻一点，给对方留出舒服的说话空间。"
  },
  {
    id: "be-real",
    cue: "语气温柔但不煽情，告诉对方不用表现得状态很好，按现在真实的感觉聊天就行。"
  },
  {
    id: "take-a-breath",
    cue: "像让朋友先喘口气那样开场，不讲大道理，再自然邀请对方说此刻最挂心的事。"
  },
  {
    id: "relax-shoulders",
    cue: "先用一句很日常的话让气氛松一点，再说今天过得普通也好、乱糟糟也好，都可以在这里聊。"
  },
  {
    id: "silence-is-fine",
    cue: "自然说不需要担心冷场，想说就说、想停一下也没关系，语气像朋友而不是客服。"
  },
  {
    id: "easy-conversation",
    cue: "用最简单的同龄人问候开始，把接下来的语音定义成轻松随意的小聊天。"
  }
] as const;
const REALTIME_OPENING_HISTORY_KEY = "minsi-realtime-opening-history-v1";
const REALTIME_OPENING_HISTORY_LIMIT = REALTIME_OPENINGS.length - 1;
let lastRealtimeOpeningId = "";
const SILENT_WAV_DATA_URI = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
function appendVoiceRecentTurns(
  recentTurns: ChatContextTurn[],
  userContent: string,
  assistantContent: string
): ChatContextTurn[] {
  const candidates: ChatContextTurn[] = [
    ...recentTurns,
    { role: "user", content: userContent.trim() },
    { role: "assistant", content: assistantContent.trim() }
  ];
  const bounded: ChatContextTurn[] = [];
  let usedLength = 0;

  for (const turn of candidates.slice(-CHAT_CONTEXT_MAX_TURNS).reverse()) {
    if (!turn.content) {
      continue;
    }

    const turnLength = getCharLength(turn.content);
    if (usedLength + turnLength > VOICE_CHAT_CONTEXT_MAX_LENGTH) {
      break;
    }

    bounded.push(turn);
    usedLength += turnLength;
  }

  return bounded.reverse();
}

type VoiceState = "idle" | "listening" | "paused" | "speaking";
type VoiceApiStatus = "creating-session" | "requesting-microphone" | "connecting" | "ready" | "error";
type SafetyResourceStatus = "loading" | "ready" | "error";
type RecordingStopReason = "silence" | "timeout";

interface VoiceStateCopy {
  label: string;
  title: string;
  helper: string;
  sideHelper: string;
}

const voiceStateCopy: Record<VoiceState, VoiceStateCopy> = {
  idle: {
    label: "正在准备语音",
    title: "正在准备语音",
    helper: "稍等一下，马上就可以开始。",
    sideHelper: "正在建立临时语音连接。"
  },
  listening: {
    label: "正在聆听中…",
    title: "正在聆听中…",
    helper: "我在认真听你说",
    sideHelper: "你可以自然地说，停顿后我会回应。"
  },
  paused: {
    label: "马上回应你",
    title: "马上回应你",
    helper: "已经听到了",
    sideHelper: "Minsi 已经听到，马上就会开口。"
  },
  speaking: {
    label: "Minsi 正在回应",
    title: "Minsi 正在回应",
    helper: "你可以听完后继续说",
    sideHelper: "Minsi 正在实时回应你。"
  }
};

function getVoiceStateCopy(baseCopy: VoiceStateCopy, apiStatus: VoiceApiStatus, statusMessage: string): VoiceStateCopy {
  if (apiStatus === "creating-session" || apiStatus === "requesting-microphone" || apiStatus === "connecting") {
    return voiceStateCopy.idle;
  }

  if (apiStatus === "error") {
    return {
      label: "重新开始语音",
      title: "语音暂时不可用",
      helper: statusMessage || "请稍后刷新页面重试。",
      sideHelper: statusMessage || "请稍后刷新页面重试。"
    };
  }

  if (apiStatus === "ready" && statusMessage) {
    return {
      ...baseCopy,
      helper: statusMessage,
      sideHelper: statusMessage
    };
  }

  return baseCopy;
}

type VoiceStageStyle = CSSProperties & {
  "--voice-audio-level": string;
};

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

function VoiceStatusPill({ copy, state, onClick }: { copy: VoiceStateCopy; state: VoiceState; onClick?: () => void }) {
  const isActive = state === "listening" || state === "speaking";
  const content = (
    <>
      <span className={isActive ? "voice-live-dot is-active" : "voice-live-dot"} />
      <span>{copy.label}</span>
    </>
  );

  if (onClick) {
    return (
      <button className="voice-listening-pill is-action" data-voice-state={state} type="button" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <div className="voice-listening-pill" data-voice-state={state} aria-live="polite">
      {content}
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
        <span className="voice-tip-spark" aria-hidden="true">✧</span>
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

function VoiceReactiveWave({ state, bands }: { state: VoiceState; bands: number[] }) {
  return (
    <div className="voice-wave-reactive" data-voice-state={state} aria-hidden="true">
      {WAVE_BARS.map((index) => {
        const bandLevel = bands[index] ?? IDLE_WAVE_BANDS[index] ?? 0;
        return (
          <span
            className="voice-wave-bar"
            key={index}
            style={{
              height: `${Math.round(12 + bandLevel * 82)}%`,
              opacity: 0.34 + bandLevel * 0.62
            }}
          />
        );
      })}
    </div>
  );
}

function EmergencyCard({ resource, resourceStatus }: { resource?: SafetyResource; resourceStatus: SafetyResourceStatus }) {
  const resourceName = resource?.name || (resourceStatus === "loading" ? "正在加载帮助资源" : "暂时无法加载帮助资源");
  const resourceContact = resource?.contact || (resourceStatus === "loading" ? "请稍等" : "请联系可信任的大人或当地紧急服务");

  return (
    <GlassCard as="aside" className="voice-side-card voice-emergency-card" id="voice-emergency-help" aria-labelledby="voice-emergency-title">
      <div className="voice-emergency-heading">
        <ShieldIcon className="voice-emergency-icon" />
        <h2 id="voice-emergency-title">紧急帮助</h2>
      </div>
      <p className="voice-emergency-copy">如果你正在经历危险，或有伤害自己/他人的想法，请及时联系可信任的大人或当地紧急服务。</p>
      <p className="voice-emergency-resource">
        {resourceName}
        <br />
        {resourceContact}
      </p>
      <SafetyNotice
        variant="desktop"
        className="voice-emergency-note"
        text="Minsi 不是医生或心理治疗师；遇到危险时，请联系可信任的大人或专业机构。"
      />
      <MinsiButton className="voice-emergency-button" type="button" disabled={resourceStatus !== "ready"}>
        查看帮助资源
        <ExternalIcon className="voice-emergency-button-icon" />
      </MinsiButton>
    </GlassCard>
  );
}

export function VoiceChatPage() {
  const router = useRouter();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [apiStatus, setApiStatus] = useState<VoiceApiStatus>("creating-session");
  const [statusMessage, setStatusMessage] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveBands, setWaveBands] = useState<number[]>(IDLE_WAVE_BANDS);
  const [safetyResources, setSafetyResources] = useState<SafetyResource[]>([]);
  const [safetyResourceStatus, setSafetyResourceStatus] = useState<SafetyResourceStatus>("loading");
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioFrameRef = useRef<number | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const turnTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const voiceTokenRef = useRef("");
  const voiceRecentTurnsRef = useRef<ChatContextTurn[]>([]);
  const lifecycleRef = useRef(0);
  const recordingStartedAtRef = useRef(0);
  const recordingStopReasonRef = useRef<RecordingStopReason>("silence");
  const speechStartedAtRef = useRef(0);
  const lastSpeechAtRef = useRef(0);
  const processingTurnRef = useRef(false);
  const voiceStateRef = useRef<VoiceState>("idle");
  const playbackUrlRef = useRef("");
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const realtimeConnectControllerRef = useRef<AbortController | null>(null);
  const realtimePeerRef = useRef<RTCPeerConnection | null>(null);
  const realtimeDataChannelRef = useRef<RTCDataChannel | null>(null);
  const responsePendingTimerRef = useRef<number | null>(null);
  const beginListeningTurnRef = useRef<(lifecycleId: number) => void>(() => undefined);
  const processVoiceTurnRef = useRef<(audioBlob: Blob, lifecycleId: number) => void>(() => undefined);
  const copy = getVoiceStateCopy(voiceStateCopy[voiceState], apiStatus, statusMessage);
  const voiceStageStyle: VoiceStageStyle = { "--voice-audio-level": audioLevel.toFixed(2) };

  const updateVoiceState = useCallback((nextState: VoiceState) => {
    voiceStateRef.current = nextState;
    setVoiceState(nextState);
  }, []);

  const clearTurnTimer = useCallback(() => {
    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }
  }, []);

  const clearResponsePendingTimer = useCallback(() => {
    if (responsePendingTimerRef.current !== null) {
      window.clearTimeout(responsePendingTimerRef.current);
      responsePendingTimerRef.current = null;
    }
  }, []);

  const scheduleResponsePendingIndicator = useCallback((lifecycleId: number) => {
    if (responsePendingTimerRef.current !== null) {
      return;
    }
    responsePendingTimerRef.current = window.setTimeout(() => {
      responsePendingTimerRef.current = null;
      if (lifecycleId !== lifecycleRef.current || voiceStateRef.current === "speaking") {
        return;
      }
      setApiStatus("ready");
      setStatusMessage("");
      updateVoiceState("paused");
    }, RESPONSE_PENDING_INDICATOR_DELAY_MS);
  }, [updateVoiceState]);

  const runVoiceRequest = useCallback(async <T,>(requestFactory: (signal: AbortSignal) => Promise<T>) => {
    activeRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeRequestControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), VOICE_REQUEST_TIMEOUT_MS);

    try {
      return await requestFactory(controller.signal);
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("voice_request_timeout");
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      if (activeRequestControllerRef.current === controller) {
        activeRequestControllerRef.current = null;
      }
    }
  }, []);

  const stopCurrentRecording = useCallback((reason: RecordingStopReason = "silence") => {
    clearTurnTimer();
    recordingStopReasonRef.current = reason;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }, [clearTurnTimer]);

  const handleInputLevel = useCallback((level: number) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording" || processingTurnRef.current || voiceStateRef.current !== "listening") {
      return;
    }

    const now = performance.now();
    if (level >= SPEECH_LEVEL_THRESHOLD) {
      if (speechStartedAtRef.current === 0) {
        speechStartedAtRef.current = now;
      }
      lastSpeechAtRef.current = now;
    }

    const hasSpeech = speechStartedAtRef.current > 0;
    const recordingDuration = now - recordingStartedAtRef.current;
    const speechDuration = hasSpeech ? lastSpeechAtRef.current - speechStartedAtRef.current : 0;
    const silenceDuration = hasSpeech ? now - lastSpeechAtRef.current : 0;
    if (hasSpeech && speechDuration < MIN_DETECTED_SPEECH_MS && silenceDuration >= END_OF_SPEECH_SILENCE_MS) {
      speechStartedAtRef.current = 0;
      lastSpeechAtRef.current = 0;
      return;
    }

    if (hasSpeech && speechDuration >= MIN_DETECTED_SPEECH_MS && recordingDuration >= MIN_TURN_RECORDING_MS && silenceDuration >= END_OF_SPEECH_SILENCE_MS) {
      stopCurrentRecording();
    }
  }, [stopCurrentRecording]);

  const stopWaveMonitor = useCallback(() => {
    if (audioFrameRef.current !== null) {
      window.cancelAnimationFrame(audioFrameRef.current);
      audioFrameRef.current = null;
    }
    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setWaveBands(IDLE_WAVE_BANDS);
  }, []);

  const startWaveMonitor = useCallback(async (stream: MediaStream) => {
    stopWaveMonitor();
    const AudioContextConstructor = window.AudioContext
      || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    try {
      const context = new AudioContextConstructor();
      const inputAnalyser = context.createAnalyser();
      inputAnalyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(inputAnalyser);
      audioContextRef.current = context;
      inputAnalyserRef.current = inputAnalyser;
      if (context.state === "suspended") {
        await context.resume().catch(() => undefined);
      }

      const samples = new Uint8Array(inputAnalyser.fftSize);
      const frequencies = new Uint8Array(inputAnalyser.frequencyBinCount);
      const tick = () => {
        const state = voiceStateRef.current;
        const analyser = state === "speaking"
          ? outputAnalyserRef.current || inputAnalyserRef.current
          : inputAnalyserRef.current;

        if (!analyser || (state !== "listening" && state !== "speaking")) {
          setAudioLevel(0);
          setWaveBands(IDLE_WAVE_BANDS);
        } else {
          analyser.getByteTimeDomainData(samples);
          analyser.getByteFrequencyData(frequencies);
          const level = getAudioRmsLevel(samples, state === "speaking" ? 7 : 6);
          setAudioLevel(level);
          setWaveBands(getReactiveWaveBands(frequencies, level));
          if (state === "listening") {
            handleInputLevel(level);
          }
        }
        audioFrameRef.current = window.requestAnimationFrame(tick);
      };
      audioFrameRef.current = window.requestAnimationFrame(tick);
    } catch {
      stopWaveMonitor();
    }
  }, [handleInputLevel, stopWaveMonitor]);

  const attachRemoteWaveMonitor = useCallback((stream: MediaStream) => {
    const context = audioContextRef.current;
    if (!context) {
      return;
    }
    try {
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      outputAnalyserRef.current = analyser;
    } catch {
      outputAnalyserRef.current = null;
    }
  }, []);

  const unlockAudioPlayback = useCallback(async () => {
    const audio = remoteAudioRef.current;
    if (!audio) {
      return;
    }

    try {
      audio.muted = true;
      audio.srcObject = null;
      audio.src = SILENT_WAV_DATA_URI;
      await audio.play();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    } catch {
      audio.removeAttribute("src");
      audio.load();
    } finally {
      audio.muted = false;
    }
  }, []);

  const closeRealtimeTransport = useCallback(() => {
    clearResponsePendingTimer();
    realtimeConnectControllerRef.current?.abort();
    realtimeConnectControllerRef.current = null;

    const dataChannel = realtimeDataChannelRef.current;
    realtimeDataChannelRef.current = null;
    if (dataChannel) {
      dataChannel.onopen = null;
      dataChannel.onclose = null;
      dataChannel.onerror = null;
      dataChannel.onmessage = null;
      dataChannel.close();
    }

    const peerConnection = realtimePeerRef.current;
    realtimePeerRef.current = null;
    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.close();
    }

    outputAnalyserRef.current = null;
    const remoteAudio = remoteAudioRef.current;
    if (remoteAudio?.srcObject) {
      remoteAudio.pause();
      remoteAudio.srcObject = null;
      remoteAudio.load();
    }
  }, [clearResponsePendingTimer]);

  const closeVoiceTransport = useCallback(() => {
    lifecycleRef.current += 1;
    closeRealtimeTransport();
    clearTurnTimer();
    if (sessionTimerRef.current !== null) {
      window.clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    activeRequestControllerRef.current?.abort();
    activeRequestControllerRef.current = null;
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
    recordedChunksRef.current = [];
    processingTurnRef.current = false;
    voiceTokenRef.current = "";
    voiceRecentTurnsRef.current = [];
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.removeAttribute("src");
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current.load();
    }
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = "";
    }
    stopWaveMonitor();
  }, [clearTurnTimer, closeRealtimeTransport, stopWaveMonitor]);

  const connectRealtimeVoice = useCallback(async (
    session: VoiceSession,
    localStream: MediaStream,
    lifecycleId: number
  ) => {
    if (!session.realtimeClientSecret || !session.realtimeModel || typeof RTCPeerConnection === "undefined") {
      throw new Error("realtime_unavailable");
    }

    const peerConnection = new RTCPeerConnection();
    realtimePeerRef.current = peerConnection;

    peerConnection.ontrack = (event) => {
      if (lifecycleId !== lifecycleRef.current || realtimePeerRef.current !== peerConnection) {
        return;
      }
      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      const audio = remoteAudioRef.current;
      if (audio) {
        audio.src = "";
        audio.srcObject = remoteStream;
        void audio.play().catch(() => undefined);
      }
      attachRemoteWaveMonitor(remoteStream);
    };

    peerConnection.onconnectionstatechange = () => {
      if (lifecycleId !== lifecycleRef.current || realtimePeerRef.current !== peerConnection) {
        return;
      }
      if (peerConnection.connectionState === "failed") {
        setApiStatus("error");
        setStatusMessage("实时语音连接中断，请重新开始。");
        updateVoiceState("idle");
      }
    };

    for (const track of localStream.getAudioTracks()) {
      peerConnection.addTrack(track, localStream);
    }

    const dataChannel = peerConnection.createDataChannel("oai-events");
    realtimeDataChannelRef.current = dataChannel;
    dataChannel.onmessage = (messageEvent) => {
      if (lifecycleId !== lifecycleRef.current || realtimeDataChannelRef.current !== dataChannel) {
        return;
      }

      const event = parseRealtimeServerEvent(messageEvent.data);
      if (!event) {
        return;
      }

      switch (event.type) {
        case "input_audio_buffer.speech_started":
          clearResponsePendingTimer();
          setApiStatus("ready");
          setStatusMessage("");
          updateVoiceState("listening");
          break;
        case "input_audio_buffer.speech_stopped":
        case "response.created":
          scheduleResponsePendingIndicator(lifecycleId);
          break;
        case "output_audio_buffer.started":
        case "response.output_audio.delta":
          clearResponsePendingTimer();
          setApiStatus("ready");
          setStatusMessage("");
          updateVoiceState("speaking");
          break;
        case "output_audio_buffer.stopped":
        case "output_audio_buffer.cleared":
          clearResponsePendingTimer();
          setApiStatus("ready");
          setStatusMessage("");
          updateVoiceState("listening");
          break;
        case "response.done":
          clearResponsePendingTimer();
          if (voiceStateRef.current === "paused") {
            setStatusMessage("");
            updateVoiceState("listening");
          }
          break;
        case "error":
          clearResponsePendingTimer();
          setApiStatus("error");
          setStatusMessage("实时语音暂时出现问题，请重新开始。");
          updateVoiceState("idle");
          break;
        default:
          break;
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const offerSdp = peerConnection.localDescription?.sdp || offer.sdp;
    if (!offerSdp) {
      throw new Error("realtime_offer_missing");
    }

    const connectController = new AbortController();
    realtimeConnectControllerRef.current = connectController;
    const connectTimeout = window.setTimeout(() => connectController.abort(), REALTIME_CONNECT_TIMEOUT_MS);
    try {
      const response = await fetch(REALTIME_CALLS_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.realtimeClientSecret}`,
          "Content-Type": "application/sdp"
        },
        body: offerSdp,
        cache: "no-store",
        signal: connectController.signal
      });
      if (!response.ok) {
        throw new Error("realtime_sdp_failed");
      }
      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription({ type: "answer", sdp: answerSdp });
      await waitForRealtimeDataChannel(dataChannel, REALTIME_CONNECT_TIMEOUT_MS);
    } finally {
      window.clearTimeout(connectTimeout);
      if (realtimeConnectControllerRef.current === connectController) {
        realtimeConnectControllerRef.current = null;
      }
    }

    if (lifecycleId !== lifecycleRef.current) {
      throw new Error("realtime_cancelled");
    }

    setApiStatus("ready");
    setStatusMessage("连接好了，Minsi 马上就开口。");
    updateVoiceState("idle");
    sendRealtimeOpening(dataChannel);
  }, [attachRemoteWaveMonitor, clearResponsePendingTimer, scheduleResponsePendingIndicator, updateVoiceState]);

  const playReplyAudio = useCallback(async (contentType: string, audioBase64: string, lifecycleId: number) => {
    const audio = remoteAudioRef.current;
    if (!audio || !audioBase64) {
      return;
    }

    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = "";
    }

    const blob = base64ToBlob(audioBase64, contentType || "audio/wav");
    const url = URL.createObjectURL(blob);
    playbackUrlRef.current = url;
    audio.srcObject = null;
    audio.src = url;
    outputAnalyserRef.current = null;
    const capturedStream = captureAudioElementStream(audio);
    if (capturedStream) {
      attachRemoteWaveMonitor(capturedStream);
    }

    updateVoiceState("speaking");
    await audioContextRef.current?.resume().catch(() => undefined);
    await audio.play();
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
    });
    if (lifecycleId === lifecycleRef.current) {
      outputAnalyserRef.current = null;
    }
  }, [attachRemoteWaveMonitor, updateVoiceState]);

  const beginListeningTurn = useCallback((lifecycleId: number) => {
    if (lifecycleId !== lifecycleRef.current || !localStreamRef.current || !voiceTokenRef.current) {
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setApiStatus("error");
      setStatusMessage("当前浏览器不支持录音，请切换到文字聊天。");
      updateVoiceState("idle");
      return;
    }

    clearTurnTimer();
    recordedChunksRef.current = [];
    processingTurnRef.current = false;
    speechStartedAtRef.current = 0;
    lastSpeechAtRef.current = 0;
    recordingStartedAtRef.current = performance.now();
    recordingStopReasonRef.current = "silence";
    updateVoiceState("listening");
    setApiStatus("ready");
    setStatusMessage("");

    const mimeType = getSupportedRecordingMimeType();
    const recorder = mimeType
      ? new MediaRecorder(localStreamRef.current, { mimeType })
      : new MediaRecorder(localStreamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      if (lifecycleId !== lifecycleRef.current || processingTurnRef.current) {
        return;
      }
      const chunks = recordedChunksRef.current;
      recordedChunksRef.current = [];
      mediaRecorderRef.current = null;
      const speechDuration = speechStartedAtRef.current > 0 ? lastSpeechAtRef.current - speechStartedAtRef.current : 0;
      const recordingDuration = performance.now() - recordingStartedAtRef.current;
      const audioBlob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      const canUseTimeoutFallback = recordingStopReasonRef.current === "timeout"
        && recordingDuration >= 3000
        && audioBlob.size >= MIN_RECORDED_AUDIO_BYTES * 2;
      if (!canUseTimeoutFallback && (speechDuration < MIN_DETECTED_SPEECH_MS || chunks.length === 0 || audioBlob.size < MIN_RECORDED_AUDIO_BYTES)) {
        if (lifecycleId === lifecycleRef.current) {
          window.setTimeout(() => beginListeningTurnRef.current(lifecycleId), 150);
        }
        return;
      }
      void processVoiceTurnRef.current(audioBlob, lifecycleId);
    };

    recorder.start(250);
    turnTimerRef.current = window.setTimeout(() => {
      stopCurrentRecording("timeout");
    }, MAX_TURN_RECORDING_MS);
  }, [clearTurnTimer, stopCurrentRecording, updateVoiceState]);

  const processVoiceTurn = useCallback(async (audioBlob: Blob, lifecycleId: number) => {
    if (lifecycleId !== lifecycleRef.current || !voiceTokenRef.current) {
      return;
    }

    processingTurnRef.current = true;
    clearTurnTimer();
    updateVoiceState("paused");
    setApiStatus("ready");
    setStatusMessage("");

    try {
      setStatusMessage("正在理解你刚才说的话。");
      const transcription = await runVoiceRequest((signal) => transcribeVoiceAudio(
        voiceTokenRef.current,
        audioBlob,
        getRecordingFilename(audioBlob.type),
        signal
      ));
      const currentTurnText = transcription.text.trim();
      if (!currentTurnText) {
        throw new Error("voice_not_clear");
      }

      setStatusMessage("正在组织回应和声音。");
      const recentTurns = voiceRecentTurnsRef.current;
      const chatResponse = await runVoiceRequest((signal) => sendChatMessage(currentTurnText, recentTurns, { includeAudio: true, signal }));
      if (!chatResponse.replyAudioBase64) {
        throw new Error("voice_audio_missing");
      }
      await playReplyAudio(chatResponse.replyAudioContentType || "audio/wav", chatResponse.replyAudioBase64, lifecycleId);
      if (lifecycleId === lifecycleRef.current) {
        voiceRecentTurnsRef.current = appendVoiceRecentTurns(recentTurns, currentTurnText, chatResponse.reply);
        processingTurnRef.current = false;
        window.setTimeout(() => beginListeningTurnRef.current(lifecycleId), 250);
      }
    } catch (error) {
      if (lifecycleId !== lifecycleRef.current) {
        return;
      }
      processingTurnRef.current = false;
      if (isVoiceNotClearError(error)) {
        setStatusMessage("这一句没有听清，可以再说一遍。");
        setApiStatus("ready");
        updateVoiceState("listening");
        window.setTimeout(() => beginListeningTurnRef.current(lifecycleId), 350);
        return;
      }
      setApiStatus("error");
      setStatusMessage(toVoiceErrorMessage(error, "语音处理失败，请重新开始。"));
      updateVoiceState("idle");
    }
  }, [clearTurnTimer, playReplyAudio, runVoiceRequest, updateVoiceState]);

  useEffect(() => {
    beginListeningTurnRef.current = beginListeningTurn;
  }, [beginListeningTurn]);

  useEffect(() => {
    processVoiceTurnRef.current = processVoiceTurn;
  }, [processVoiceTurn]);

  const startVoiceConversation = useCallback(async () => {
    const lifecycleId = lifecycleRef.current + 1;
    lifecycleRef.current = lifecycleId;
    closeVoiceTransport();
    lifecycleRef.current = lifecycleId;
    updateVoiceState("idle");
    setApiStatus("creating-session");
    setStatusMessage("");

    try {
      if (!window.isSecureContext) {
        throw new Error(VOICE_SECURE_CONTEXT_ERROR);
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Voice recording is not supported by this browser.");
      }

      void unlockAudioPlayback();
      setApiStatus("requesting-microphone");
      const [microphoneResult, realtimeSessionResult] = await Promise.allSettled([
        navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1
          }
        }),
        createVoiceSession()
      ]);
      if (microphoneResult.status === "rejected") {
        throw microphoneResult.reason;
      }

      let session: VoiceSession;
      let shouldUseRealtime = realtimeSessionResult.status === "fulfilled";
      if (realtimeSessionResult.status === "fulfilled") {
        session = realtimeSessionResult.value;
        shouldUseRealtime = Boolean(session.realtimeClientSecret && session.realtimeModel);
      } else {
        try {
          session = await createVoiceSession({ realtime: false });
          shouldUseRealtime = false;
        } catch {
          microphoneResult.value.getTracks().forEach((track) => track.stop());
          throw realtimeSessionResult.reason;
        }
      }

      const localStream = microphoneResult.value;
      if (lifecycleId !== lifecycleRef.current) {
        localStream.getTracks().forEach((track) => track.stop());
        return;
      }
      localStreamRef.current = localStream;
      void startWaveMonitor(localStream);

      voiceTokenRef.current = session.voiceToken;
      const sessionSeconds = Math.min(Math.max(session.expiresInSeconds, 1), MAX_VOICE_SESSION_SECONDS);
      sessionTimerRef.current = window.setTimeout(() => {
        if (lifecycleId !== lifecycleRef.current) {
          return;
        }
        closeVoiceTransport();
        setApiStatus("error");
        setStatusMessage("本次临时语音已结束，请切换文字或重新开始。");
        updateVoiceState("idle");
      }, sessionSeconds * 1000);

      if (shouldUseRealtime) {
        setApiStatus("connecting");
        try {
          await connectRealtimeVoice(session, localStream, lifecycleId);
          return;
        } catch {
          if (lifecycleId !== lifecycleRef.current) {
            return;
          }
          closeRealtimeTransport();
          setStatusMessage("实时连接暂时不可用，已切换到普通语音。");
        }
      }

      beginListeningTurn(lifecycleId);
    } catch (error) {
      if (lifecycleId !== lifecycleRef.current) {
        return;
      }
      closeVoiceTransport();
      lifecycleRef.current = lifecycleId;
      setApiStatus("error");
      setStatusMessage(toVoiceErrorMessage(error, "语音暂时不可用，请稍后刷新页面重试。"));
      updateVoiceState("idle");
    }
  }, [
    beginListeningTurn,
    closeRealtimeTransport,
    closeVoiceTransport,
    connectRealtimeVoice,
    startWaveMonitor,
    unlockAudioPlayback,
    updateVoiceState
  ]);

  useEffect(() => {
    const autoStartTimer = window.setTimeout(() => {
      void startVoiceConversation();
    }, 0);

    return () => {
      window.clearTimeout(autoStartTimer);
      closeVoiceTransport();
    };
  }, [closeVoiceTransport, startVoiceConversation]);

  useEffect(() => {
    let active = true;
    async function loadResources() {
      try {
        const resources = await getSafetyResources("zh");
        if (active) {
          setSafetyResources(resources);
          setSafetyResourceStatus("ready");
        }
      } catch {
        if (active) {
          setSafetyResources([]);
          setSafetyResourceStatus("error");
        }
      }
    }
    void loadResources();
    return () => {
      active = false;
    };
  }, []);

  function handleSwitchToText() {
    closeVoiceTransport();
    setStatusMessage("");
    setApiStatus("creating-session");
    updateVoiceState("idle");
    router.push("/chat");
  }

  function handleVoiceStatusAction() {
    if (apiStatus !== "error") {
      return;
    }
    void startVoiceConversation();
  }

  return (
    <main className="voice-chat-page" data-voice-state={voiceState}>
      <audio ref={remoteAudioRef} autoPlay playsInline className="voice-remote-audio" aria-hidden="true" />
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
            <VoiceReactiveWave state={voiceState} bands={waveBands} />
            <div className="voice-stage-actions" aria-label="语音状态和聊天模式">
              <VoiceStatusPill
                copy={copy}
                state={voiceState}
                onClick={apiStatus === "error" ? handleVoiceStatusAction : undefined}
              />
              <MinsiButton className="voice-control-button voice-switch-text-button" type="button" onClick={handleSwitchToText}>
                <MessageIcon className="voice-control-icon voice-control-icon-message" />
                <span>切换文字</span>
              </MinsiButton>
            </div>
          </section>

          <SafetyNotice
            variant="desktop"
            className="voice-panel-safety-note"
            text="语音不保存，退出清除；Minsi 不是医生或心理治疗师。"
          />

          <aside className="voice-sidebar" id="voice-mobile-status-panel" aria-label="语音聊天辅助信息">
            <QuickStatusCard copy={copy} state={voiceState} />
            <TipCard />
            <EmergencyCard resource={safetyResources[0]} resourceStatus={safetyResourceStatus} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function toVoiceErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "voice_request_timeout") {
    return "语音服务响应超时，请重新开始。";
  }
  if (error instanceof Error && error.message === "voice_audio_missing") {
    return "声音合成暂时不可用，请稍后重试。";
  }
  if (error instanceof Error && error.message === VOICE_SECURE_CONTEXT_ERROR) {
    return "手机语音需要 HTTPS 安全连接，请使用 HTTPS 地址重新打开此页面。";
  }
  if (error instanceof ApiFetchError && error.message) {
    return error.message;
  }
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "无法使用麦克风，请允许浏览器麦克风权限后点击“重新开始语音”。";
  }
  return fallback;
}

function isVoiceNotClearError(error: unknown) {
  return error instanceof ApiFetchError && error.code === "VOICE_NOT_CLEAR";
}

function parseRealtimeServerEvent(data: unknown): { type: string } | null {
  if (typeof data !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(data) as { type?: unknown };
    return typeof parsed.type === "string" ? { type: parsed.type } : null;
  } catch {
    return null;
  }
}

function waitForRealtimeDataChannel(dataChannel: RTCDataChannel, timeoutMs: number) {
  if (dataChannel.readyState === "open") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => finish(new Error("realtime_data_channel_timeout")), timeoutMs);
    const handleOpen = () => finish();
    const handleError = () => finish(new Error("realtime_data_channel_error"));
    const handleClose = () => finish(new Error("realtime_data_channel_closed"));

    function finish(error?: Error) {
      window.clearTimeout(timeoutId);
      dataChannel.removeEventListener("open", handleOpen);
      dataChannel.removeEventListener("error", handleError);
      dataChannel.removeEventListener("close", handleClose);
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }

    dataChannel.addEventListener("open", handleOpen);
    dataChannel.addEventListener("error", handleError);
    dataChannel.addEventListener("close", handleClose);
  });
}

function sendRealtimeOpening(dataChannel: RTCDataChannel) {
  const opening = selectRealtimeOpening();

  dataChannel.send(JSON.stringify({
    type: "response.create",
    response: {
      conversation: "none",
      output_modalities: ["audio"],
      max_output_tokens: 240,
      instructions: [
        "用简体中文普通话完成新会话开场，整段不能出现英文单词或英文语气词。",
        "按情境临场说 2 至 3 个自然短句，约 8 至 10 秒，不逐字朗读情境。",
        "像刚接通年轻朋友：轻盈、温柔、带真实笑意，不像成熟长辈在开导人。",
        "使用青少年容易听懂的日常词，不强行玩梗、装学生、撒娇或卖萌。",
        "优先用陈述句自然收尾；不说指令、编号、客服或心理咨询套话，也不虚构记得以前的会话。"
      ].join("\n"),
      input: [{
        type: "message",
        role: "user",
        content: [{
          type: "input_text",
          text: `本次开场情境：${opening.cue}`
        }]
      }]
    }
  }));
}

function selectRealtimeOpening() {
  const recentOpeningIds = readRecentOpeningIds();
  const blockedOpeningIds = new Set([...recentOpeningIds, lastRealtimeOpeningId].filter(Boolean));
  const availableOpenings = REALTIME_OPENINGS.filter((opening) => !blockedOpeningIds.has(opening.id));
  const candidates = availableOpenings.length > 0
    ? availableOpenings
    : REALTIME_OPENINGS.filter((opening) => opening.id !== lastRealtimeOpeningId);
  const randomValue = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
    ? crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000
    : Math.random();
  const opening = candidates[Math.floor(randomValue * candidates.length)] || REALTIME_OPENINGS[0];

  lastRealtimeOpeningId = opening.id;
  writeRecentOpeningIds([
    opening.id,
    ...recentOpeningIds.filter((id) => id !== opening.id)
  ].slice(0, REALTIME_OPENING_HISTORY_LIMIT));
  return opening;
}

function readRecentOpeningIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(REALTIME_OPENING_HISTORY_KEY);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];
    if (!Array.isArray(parsedValue)) {
      return [];
    }
    const knownOpeningIds = new Set<string>(REALTIME_OPENINGS.map((opening) => opening.id));
    return parsedValue
      .filter((value): value is string => typeof value === "string" && knownOpeningIds.has(value))
      .slice(0, REALTIME_OPENING_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function writeRecentOpeningIds(openingIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Only non-sensitive template IDs are stored. No user audio, transcript, or generated reply is persisted.
    window.localStorage.setItem(REALTIME_OPENING_HISTORY_KEY, JSON.stringify(openingIds));
  } catch {
    // Private browsing or disabled storage still keeps the in-memory immediate-repeat guard.
  }
}

function getSupportedRecordingMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
    return "";
  }
  return [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac"
  ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
}

function getRecordingFilename(mimeType: string) {
  if (mimeType.includes("mp4") || mimeType.includes("aac")) {
    return "voice-input.m4a";
  }
  return "voice-input.webm";
}

function captureAudioElementStream(audio: HTMLAudioElement) {
  const capture = (audio as HTMLAudioElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  }).captureStream || (audio as HTMLAudioElement & {
    mozCaptureStream?: () => MediaStream;
  }).mozCaptureStream;
  try {
    return capture?.call(audio) || null;
  } catch {
    return null;
  }
}

function base64ToBlob(base64: string, contentType: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: contentType });
}

function getAudioRmsLevel(samples: Uint8Array, multiplier: number) {
  let sum = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const normalized = (samples[index] - 128) / 128;
    sum += normalized * normalized;
  }
  return Math.min(1, Math.sqrt(sum / samples.length) * multiplier);
}

function getReactiveWaveBands(frequencySamples: Uint8Array, audioLevel: number) {
  const usableLength = Math.max(WAVE_BAND_COUNT, Math.floor(frequencySamples.length * 0.72));
  const groupSize = Math.max(1, Math.floor(usableLength / WAVE_BAND_COUNT));
  const midpoint = (WAVE_BAND_COUNT - 1) / 2;

  return WAVE_BARS.map((barIndex) => {
    const start = barIndex * groupSize;
    const end = Math.min(start + groupSize, usableLength);
    let sum = 0;
    for (let index = start; index < end; index += 1) {
      sum += frequencySamples[index] ?? 0;
    }
    const average = end > start ? sum / (end - start) / 255 : 0;
    const centerWeight = 1 - Math.abs(barIndex - midpoint) / midpoint;
    return Math.min(1, average * 1.35 + audioLevel * 0.34 + centerWeight * 0.1);
  });
}
