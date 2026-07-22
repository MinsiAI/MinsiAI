"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiFetchError } from "../../lib/api/http";
import { getCurrentAdmin, resolveSafeAdminRedirect, sendAdminEmailCode, verifyAdminEmailCode } from "../../lib/admin/admin-api";
import styles from "./AdminPages.module.css";

type LoginStep = "email" | "code";

export function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = resolveSafeAdminRedirect(searchParams.get("redirect"));
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCurrentAdmin()
      .then(() => {
        if (!cancelled) {
          router.replace(redirectPath);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [redirectPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setMessage("");

    try {
      if (step === "email") {
        await sendAdminEmailCode(email);
        setStep("code");
        setMessage("如果该邮箱是有效管理员账号，验证码会发送到对应邮箱。");
        return;
      }

      await verifyAdminEmailCode(email, code);
      router.replace(redirectPath);
    } catch (error) {
      setErrorMessage(resolveLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.loginShell}>
      <section className={`${styles.panel} ${styles.loginPanel}`} aria-labelledby="admin-login-title">
        <div className={styles.loginPanelHeader}>
          <span className={styles.loginBadge}>管理员验证</span>
          <h1 id="admin-login-title">登录 Minsi 后台</h1>
          <p>使用已初始化的管理员邮箱接收验证码。</p>
        </div>

        <div className={styles.loginStepTrack} aria-label="登录步骤">
          <span className={step === "email" ? styles.loginStepActive : ""}>1. 邮箱验证</span>
          <span className={step === "code" ? styles.loginStepActive : ""}>2. 输入验证码</span>
        </div>

        <form className={`${styles.form} ${styles.loginForm}`} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>管理员邮箱</span>
            <input
              autoComplete="email"
              className={styles.input}
              disabled={isSubmitting || step === "code"}
              inputMode="email"
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="admin@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          {step === "code" ? (
            <label className={styles.field}>
              <span>邮箱验证码</span>
              <input
                autoComplete="one-time-code"
                className={`${styles.input} ${styles.codeInput}`}
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6))}
                pattern="[0-9]{6}"
                placeholder="6 位数字"
                required
                type="text"
                value={code}
              />
            </label>
          ) : null}

          <div className={styles.loginActions}>
            <button className={`${styles.button} ${styles.loginPrimaryButton}`} disabled={isSubmitting || !email.trim() || (step === "code" && code.length !== 6)} type="submit">
              {isSubmitting ? "处理中" : step === "email" ? "发送验证码" : "登录后台"}
            </button>
            {step === "code" ? (
              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                disabled={isSubmitting}
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setMessage("");
                  setErrorMessage("");
                }}
                type="button"
              >
                修改邮箱
              </button>
            ) : null}
          </div>
          {message ? <p className={`${styles.status} ${styles.statusInfo}`}>{message}</p> : null}
          {errorMessage ? <p className={`${styles.status} ${styles.statusError}`}>{errorMessage}</p> : null}
        </form>

        <div className={styles.loginFooterNote}>
          <span>没有公开注册入口</span>
          <span>验证码只发送给有效管理员邮箱</span>
        </div>
      </section>
    </main>
  );
}

function resolveLoginError(error: unknown) {
  if (error instanceof ApiFetchError) {
    if (error.code === "RATE_LIMITED") {
      return "请求太频繁，请稍后再试。";
    }
    if (error.code === "BAD_REQUEST" || error.code === "VALIDATION_FAILED") {
      return "邮箱或验证码无效。";
    }
  }
  return "登录失败，请稍后重试。";
}
