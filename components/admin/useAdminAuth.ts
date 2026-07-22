"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiFetchError } from "../../lib/api/http";
import { getCurrentAdmin } from "../../lib/admin/admin-api";
import type { CurrentAdmin } from "../../lib/admin/admin-api";

type AdminAuthState = "loading" | "authenticated" | "error";

export function useAdminAuth(currentPath: string) {
  const router = useRouter();
  const [state, setState] = useState<AdminAuthState>("loading");
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCurrentAdmin()
      .then((currentAdmin) => {
        if (cancelled) {
          return;
        }
        setAdmin(currentAdmin);
        setState("authenticated");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiFetchError && error.code === "UNAUTHORIZED") {
          router.replace(`/admin/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }
        setErrorMessage("后台登录状态校验失败，请稍后重试。");
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [currentPath, router]);

  return { state, admin, errorMessage };
}
