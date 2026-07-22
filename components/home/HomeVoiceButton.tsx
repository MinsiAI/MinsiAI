"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiFetchError, apiFetch } from "../../lib/api/http";
import { MinsiButton } from "../site/MinsiButton";

const asset = (name: string) => `/figma-assets/${name}`;
const loginRedirectPath = "/login?redirect=/chat";

interface MeResponse {
  authenticated: boolean;
}

function VoiceWave({ mobile = false }: { mobile?: boolean }) {
  const heights = mobile ? [5, 9, 14, 20, 13, 22, 11, 7] : [9, 15, 23, 33, 20, 29, 18, 26, 14, 9];

  return (
    <div className={`voice-wave flex items-center justify-center ${mobile ? "gap-[2px]" : "gap-[0.4cqw]"}`}>
      {heights.map((height, index) => (
        <span
          key={`${height}-${index}`}
          style={{
            height: mobile ? `${height}px` : `${height / 19.2}cqw`,
            width: mobile ? "3px" : "0.28cqw",
            animationDelay: `${index * 80}ms`
          }}
        />
      ))}
    </div>
  );
}

function isUnauthorized(error: unknown) {
  return error instanceof ApiFetchError && (error.status === 401 || error.code === "UNAUTHORIZED");
}

export function HomeVoiceButton({ mobile = false, label = "开始和 Minsi 聊聊", errorText = "连接暂时不太顺利，请稍后再试。" }: { mobile?: boolean; label?: string; errorText?: string }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const errorId = mobile ? "home-voice-error-mobile" : "home-voice-error-desktop";

  async function handleClick() {
    if (isChecking) {
      return;
    }

    setErrorMessage("");
    setIsChecking(true);

    try {
      const currentUser = await apiFetch<MeResponse>("/api/me");
      router.push(currentUser.authenticated ? "/chat" : loginRedirectPath);
    } catch (error) {
      if (isUnauthorized(error)) {
        router.push(loginRedirectPath);
        return;
      }

      setErrorMessage(errorText);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <>
      <MinsiButton
        className={
          mobile
            ? "voice-pulse mobile-voice-button relative z-[2] flex h-[126px] w-[126px] flex-col items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--minsi-voice-mobile-start)_0%,var(--minsi-voice-mobile-mid)_52%,var(--minsi-voice-mobile-end)_100%)] text-white"
            : "voice-pulse desktop-voice-button"
        }
        aria-busy={isChecking}
        aria-describedby={errorMessage ? errorId : undefined}
        aria-label={label}
        loading={isChecking}
        onClick={handleClick}
        type="button"
      >
        <div className={mobile ? "flex flex-col items-center" : "desktop-voice-button-content"}>
          <img className={mobile ? "mobile-mic h-[41px] w-[41px]" : "h-[5.08cqw] w-[5.08cqw]"} src={asset("icon-mic.svg")} alt="" draggable={false} />
          <span className={mobile ? "mobile-voice-text mt-[8px] text-[11px]" : "mt-[0.92cqw] text-[1.22cqw]"}>{label}</span>
          <div className={mobile ? "mobile-voice-wave-wrap mt-[6px] scale-[0.92]" : "mt-[1.08cqw]"}>
            <VoiceWave mobile={mobile} />
          </div>
        </div>
      </MinsiButton>
      {errorMessage ? (
        <p id={errorId} className={`home-voice-error ${mobile ? "home-voice-error-mobile" : "home-voice-error-desktop"}`} role="status" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
