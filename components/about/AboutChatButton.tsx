"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useId, useState } from "react";

import { ApiFetchError, apiFetch } from "../../lib/api/http";
import { MinsiButton } from "../site/MinsiButton";

const chatPath = "/chat";
const loginRedirectPath = "/login?redirect=/chat";

interface MeResponse {
  authenticated: boolean;
}

interface AboutChatButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  errorText: string;
}

function isUnauthorized(error: unknown) {
  return error instanceof ApiFetchError && (error.status === 401 || error.code === "UNAUTHORIZED");
}

export function AboutChatButton({ children, className, variant = "primary", size = "lg", errorText }: AboutChatButtonProps) {
  const router = useRouter();
  const errorId = useId();
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    if (isChecking) {
      return;
    }

    setErrorMessage("");
    setIsChecking(true);

    try {
      const currentUser = await apiFetch<MeResponse>("/api/me");
      router.push(currentUser.authenticated ? chatPath : loginRedirectPath);
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
        type="button"
        variant={variant}
        size={size}
        className={className}
        loading={isChecking}
        aria-busy={isChecking}
        aria-describedby={errorMessage ? errorId : undefined}
        onClick={handleClick}
      >
        {children}
      </MinsiButton>
      {errorMessage ? (
        <span id={errorId} className="mt-3 block text-sm font-medium text-[var(--minsi-danger)]" role="status" aria-live="polite">
          {errorMessage}
        </span>
      ) : null}
    </>
  );
}
