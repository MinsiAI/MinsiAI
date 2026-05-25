"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MinsiButton } from "../site/MinsiButton";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LockIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7.5 10.5V8.4a4.5 4.5 0 0 1 9 0v2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 10.5h12v8H6v-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function EmailLoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sendLoading, setSendLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const sendTimerRef = useRef<number | null>(null);
  const submitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (remainingSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remainingSeconds]);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current) window.clearTimeout(sendTimerRef.current);
      if (submitTimerRef.current) window.clearTimeout(submitTimerRef.current);
    };
  }, []);

  function validateEmail() {
    if (!emailPattern.test(email.trim())) {
      setError("这个邮箱格式好像不太对。");
      setMessage("");
      return false;
    }
    return true;
  }

  function handleSendCode() {
    if (remainingSeconds > 0) {
      setError("发送太频繁了，可以稍后再试一下。");
      setMessage("");
      return;
    }
    if (!validateEmail()) return;

    setError("");
    setMessage("");
    setSendLoading(true);
    sendTimerRef.current = window.setTimeout(() => {
      setSendLoading(false);
      setCodeSent(true);
      setRemainingSeconds(60);
      setMessage("验证码已经发送，请留意邮箱。");
    }, 520);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateEmail()) return;
    if (!codeSent || code.trim().length === 0) {
      setError("验证码好像不太对，可以再检查一下。");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setSubmitLoading(true);
    submitTimerRef.current = window.setTimeout(() => {
      setSubmitLoading(false);
      setMessage("验证通过，正在进入 Minsi。");
      // TODO: 接入真实登录后，由后端设置 HttpOnly Secure Cookie，再跳转到目标页面。
    }, 620);
  }

  return (
    <form className="login-email-form mx-auto mt-[12px] w-full max-w-[510px]" onSubmit={handleSubmit} noValidate>
      <label className="login-email-input flex min-h-[48px] items-center rounded-full border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-5 text-[var(--minsi-muted)] transition focus-within:border-[var(--minsi-primary)] focus-within:shadow-[var(--shadow-focus)] md:min-h-[50px]">
        <Image className="login-email-icon" src="/figma-assets/login-email.svg" alt="" width={18} height={17} draggable={false} />
        <span className="sr-only">邮箱地址</span>
        <input
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          className="login-email-field min-w-0 flex-1 bg-transparent px-3 text-[15px] leading-none text-[var(--minsi-ink)] outline-none placeholder:text-[var(--minsi-muted)] md:text-[14px]"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="请输入邮箱地址"
        />
        <MinsiButton
          type="button"
          loading={sendLoading}
          disabled={sendLoading || remainingSeconds > 0}
          onClick={handleSendCode}
          className="login-email-code-button min-h-[44px] shrink-0 border-l border-[var(--minsi-line)] pl-4 text-[14px] leading-none text-[var(--minsi-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sendLoading ? "发送中" : remainingSeconds > 0 ? `${remainingSeconds}s` : "获取验证码"}
        </MinsiButton>
      </label>

      {codeSent ? (
        <label className="mt-3 flex min-h-[48px] items-center rounded-full border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-4 text-[var(--minsi-muted)] transition focus-within:border-[var(--minsi-primary)] focus-within:shadow-[var(--shadow-focus)] md:min-h-[50px]">
          <LockIcon />
          <span className="sr-only">邮箱验证码</span>
          <input
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (error) setError("");
            }}
            className="min-w-0 flex-1 bg-transparent px-3 text-[15px] leading-none text-[var(--minsi-ink)] outline-none placeholder:text-[var(--minsi-muted)]"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="请输入验证码"
          />
        </label>
      ) : null}

      <p className="login-email-helper mt-[10px] text-center text-[14px] leading-7 text-[var(--minsi-muted)]">不用手机号，一个邮箱就可以开始</p>

      {error ? <p className="mt-2 text-center text-[13px] leading-5 text-[var(--minsi-danger)]">{error}</p> : null}
      {message ? <p className="mt-2 text-center text-[13px] leading-5 text-[var(--minsi-success)]">{message}</p> : null}

      {codeSent ? (
        <MinsiButton
          type="submit"
          loading={submitLoading}
          disabled={submitLoading}
          className="mt-3 flex min-h-[46px] w-full items-center justify-center rounded-full bg-[var(--minsi-primary)] px-5 text-[15px] font-medium text-[var(--minsi-white)] shadow-[var(--shadow-login)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitLoading ? "验证中" : "进入 Minsi"}
        </MinsiButton>
      ) : null}
    </form>
  );
}
