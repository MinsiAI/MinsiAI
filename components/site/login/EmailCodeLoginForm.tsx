"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MinsiButton } from "../MinsiButton";
import { loginWithEmailCode, resolveSafeRedirectPath, sendEmailCode } from "../../../lib/auth/login-api";
import { useCountdown } from "./useCountdown";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m5.2 8.2 6.8 5 6.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KeyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8.4" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.2 12h7.2M16.4 12v2.6M19.4 12v2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmailCodeLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [hasRequestedCode, setHasRequestedCode] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { remainingSeconds, start: startSendCooldown, reset: resetSendCooldown } = useCountdown();
  const trimmedEmail = email.trim();
  const trimmedCode = code.trim();
  const sendDisabled = sendLoading || remainingSeconds > 0;
  const showCodeStep = hasRequestedCode || code.length > 0;
  const primaryButtonText = showCodeStep
    ? submitLoading
      ? "登录中"
      : "登录"
    : sendLoading
      ? "发送中"
      : remainingSeconds > 0
        ? `${remainingSeconds}s`
        : "获取验证码";
  const primaryButtonDisabled = showCodeStep ? submitLoading : sendDisabled;

  const validateEmail = () => {
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("这个邮箱格式好像不太对。");
      setMessage(null);
      return false;
    }

    return true;
  };

  const handleSendCode = async () => {
    if (sendDisabled || !validateEmail()) {
      return;
    }

    setSendLoading(true);
    setError(null);

    try {
      const result = await sendEmailCode(trimmedEmail);

      if (result.ok) {
        setMessage("验证码已经发送，请留意邮箱。");
        setHasRequestedCode(true);
        startSendCooldown(60);
      } else {
        resetSendCooldown();
        setError("发送太频繁了，可以稍后再试一下。");
      }
    } catch {
      resetSendCooldown();
      setError("验证码发送失败，请稍后再试。");
    } finally {
      setSendLoading(false);
    }
  };

  const handleFieldChange = (value: string) => {
    if (showCodeStep) {
      setCode(value.slice(0, 8));
    } else {
      setEmail(value);
      setHasRequestedCode(false);
      setCode("");
    }

    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!showCodeStep) {
      await handleSendCode();
      return;
    }

    if (submitLoading || !validateEmail()) {
      return;
    }

    if (!trimmedCode) {
      setError("验证码不能为空。");
      setMessage(null);
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const result = await loginWithEmailCode(trimmedEmail, trimmedCode);

      if (result.ok) {
        const redirect = resolveSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
        router.replace(redirect);
        return;
      }

      setError("验证码好像不太对，可以再检查一下。");
      setMessage(null);
    } catch {
      setError("网络好像有点慢，我们再试一次。");
      setMessage(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <form className="mt-3 space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="flex h-12 w-full items-center rounded-full border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-4 shadow-[var(--shadow-language)] transition focus-within:border-[var(--minsi-primary)] focus-within:shadow-[var(--shadow-focus)]">
        <label className="relative flex min-w-0 flex-1 items-center">
          <span className="sr-only">{showCodeStep ? "邮箱验证码" : "邮箱地址"}</span>
          {showCodeStep ? (
            <KeyIcon className="mr-3 h-5 w-5 shrink-0 text-[var(--minsi-muted)]" />
          ) : (
            <MailIcon className="mr-3 h-5 w-5 shrink-0 text-[var(--minsi-muted)]" />
          )}
          <input
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--minsi-ink)] outline-none placeholder:text-[var(--minsi-muted)]"
            type={showCodeStep ? "text" : "email"}
            inputMode={showCodeStep ? "numeric" : "email"}
            autoComplete={showCodeStep ? "one-time-code" : "email"}
            placeholder={showCodeStep ? "请输入验证码" : "请输入邮箱地址"}
            maxLength={showCodeStep ? 8 : undefined}
            value={showCodeStep ? code : email}
            onChange={(event) => handleFieldChange(event.target.value)}
          />
        </label>
        <span className="mx-3 h-7 w-px bg-[var(--minsi-line)]" aria-hidden="true" />

        <MinsiButton
          type={showCodeStep ? "submit" : "button"}
          loading={showCodeStep ? submitLoading : sendLoading}
          disabled={primaryButtonDisabled}
          onClick={showCodeStep ? undefined : handleSendCode}
          className="h-full min-w-[98px] rounded-full px-1 text-right text-[14px] font-medium text-[var(--minsi-primary)] transition disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[112px]"
        >
          {primaryButtonText}
        </MinsiButton>
      </div>

      <p className="text-center text-[14px] leading-5 text-[var(--minsi-muted)]">不用手机号，一个邮箱就可以开始</p>

      {error || message ? (
        <p className="text-center text-[13px] leading-[18px] text-[var(--minsi-muted)]" aria-live="polite">
          {error ? <span className="text-[var(--minsi-danger)]">{error}</span> : message}
        </p>
      ) : null}
    </form>
  );
}
