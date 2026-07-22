"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { buildLoginRedirectUrl, isUnauthorizedError } from "../../lib/auth/protected-navigation";
import { getCurrentUser } from "../../lib/auth/session-api";

type AuthGateStatus = "checking" | "allowed" | "error";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthGateStatus>("checking");
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      setStatus("checking");

      try {
        const currentUser = await getCurrentUser();

        if (cancelled) {
          return;
        }

        if (currentUser.authenticated) {
          setStatus("allowed");
          return;
        }

        redirectToLogin(router);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (isUnauthorizedError(error)) {
          redirectToLogin(router);
          return;
        }

        setStatus("error");
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, retryNonce]);

  if (status === "allowed") {
    return <>{children}</>;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[#17145f]">
        <div>
          <p className="text-[18px] font-semibold">暂时无法确认登录状态</p>
          <button
            className="mt-5 rounded-full border border-[#8174f2] px-6 py-2 text-[15px] font-semibold text-[#17145f]"
            type="button"
            onClick={() => setRetryNonce((current) => current + 1)}
          >
            重试
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-[#17145f]" aria-busy="true">
      <p className="text-[18px] font-semibold">正在确认登录状态</p>
    </main>
  );
}

function redirectToLogin(router: ReturnType<typeof useRouter>) {
  const redirectPath = `${window.location.pathname}${window.location.search}${window.location.hash}` || "/chat";
  router.replace(buildLoginRedirectUrl(redirectPath));
}
