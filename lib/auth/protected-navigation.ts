import { ApiFetchError } from "../api/http";
import { getCurrentUser } from "./session-api";

interface ProtectedNavigationRouter {
  push(href: string): void;
}

export function buildLoginRedirectUrl(targetPath: string) {
  return `/login?redirect=${encodeURIComponent(targetPath)}`;
}

export async function pushProtectedRoute(router: ProtectedNavigationRouter, targetPath: string) {
  try {
    const currentUser = await getCurrentUser();
    router.push(currentUser.authenticated ? targetPath : buildLoginRedirectUrl(targetPath));
  } catch (error) {
    if (isUnauthorizedError(error)) {
      router.push(buildLoginRedirectUrl(targetPath));
      return;
    }

    throw error;
  }
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiFetchError && (error.status === 401 || error.code === "UNAUTHORIZED");
}
