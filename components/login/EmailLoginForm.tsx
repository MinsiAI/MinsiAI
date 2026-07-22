"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginWithEmailCode, resolveSafeRedirectPath, sendEmailCode } from "../../lib/auth/login-api";
import type { LoginMessages } from "../../lib/i18n/messages";
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

interface EmailLoginFormProps {
  copy: LoginMessages["email"];
}

export function EmailLoginForm({ copy }: EmailLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sendLoading, setSendLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (remainingSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remainingSeconds]);

  function validateEmail() {
    if (!emailPattern.test(email.trim())) {
      setError(copy.invalidEmail);
      setMessage("");
      return false;
    }
    return true;
  }

  function handleInputChange(value: string) {
    if (codeSent) {
      setCode(value.slice(0, 8));
    } else {
      setEmail(value);
    }

    if (error) setError("");
  }

  async function handleSendCode() {
    if (remainingSeconds > 0) {
      setError(copy.rateLimited);
      setMessage("");
      return;
    }
    if (!validateEmail()) return;

    setError("");
    setMessage("");
    setSendLoading(true);
    try {
      await sendEmailCode(email.trim());
      setCodeSent(true);
      setRemainingSeconds(60);
      setMessage(copy.codeSent);
    } catch {
      setError(copy.sendFailed);
      setMessage("");
    } finally {
      setSendLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codeSent) {
      await handleSendCode();
      return;
    }

    if (!validateEmail()) return;
    if (!codeSent || code.trim().length === 0) {
      setError(copy.invalidCode);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setSubmitLoading(true);
    try {
      const result = await loginWithEmailCode(email.trim(), code.trim());
      if (!result.ok) {
        setError(copy.invalidCode);
        setMessage("");
        return;
      }

      setMessage(copy.success);
      const redirect = resolveSafeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
      router.replace(redirect);
    } catch {
      setError(copy.invalidCode);
      setMessage("");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <form className="login-email-form mx-auto mt-[12px] w-full max-w-[510px]" onSubmit={handleSubmit} noValidate>
      <label className="login-email-input flex min-h-[48px] items-center rounded-full border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-5 text-[var(--minsi-muted)] transition focus-within:border-[var(--minsi-primary)] focus-within:shadow-[var(--shadow-focus)] md:min-h-[50px] lg:bg-transparent">
        {codeSent ? <LockIcon /> : <Image className="login-email-icon" src="/figma-assets/login-email.svg" alt="" width={18} height={17} draggable={false} />}
        <span className="sr-only">{codeSent ? copy.codeLabel : copy.emailLabel}</span>
        <input
          value={codeSent ? code : email}
          onChange={(event) => handleInputChange(event.target.value)}
          className="login-email-field min-w-0 flex-1 bg-transparent px-3 text-[16px] leading-none text-[var(--minsi-ink)] outline-none placeholder:text-[var(--minsi-muted)]"
          type={codeSent ? "text" : "email"}
          inputMode={codeSent ? "numeric" : "email"}
          autoComplete={codeSent ? "one-time-code" : "email"}
          placeholder={codeSent ? copy.codePlaceholder : copy.emailPlaceholder}
        />
        <MinsiButton
          type={codeSent ? "submit" : "button"}
          loading={codeSent ? submitLoading : sendLoading}
          disabled={codeSent ? submitLoading : sendLoading || remainingSeconds > 0}
          onClick={codeSent ? undefined : handleSendCode}
          className="login-email-code-button min-h-[44px] shrink-0 border-l border-[var(--minsi-line)] pl-4 text-[15px] leading-none text-[var(--minsi-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {codeSent ? (submitLoading ? copy.loginLoading : copy.login) : sendLoading ? copy.sending : remainingSeconds > 0 ? `${remainingSeconds}s` : copy.getCode}
        </MinsiButton>
      </label>

      <p className="login-email-helper mt-[10px] text-center text-[14px] leading-7 text-[var(--minsi-muted)]">{copy.helper}</p>

      {error ? <p className="mt-2 text-center text-[13px] leading-5 text-[var(--minsi-danger)]">{error}</p> : null}
      {message ? <p className="mt-2 text-center text-[13px] leading-5 text-[var(--minsi-success)]">{message}</p> : null}

    </form>
  );
}
