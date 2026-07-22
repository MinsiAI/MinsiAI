# Security And Privacy Report

Date: 2026-07-22

## Sensitive Files And Secrets

- No `.env`, private key, certificate, database, dump, or log files were found in the source scan scope after copy filtering.
- High-confidence hardcoded secret patterns were not found in source files.
- `.env.example` files contain placeholders only.
- `.gitignore` blocks secrets, local environment files, credentials, certificates, databases, logs, build output, caches, uploads, and backups.

## Chat And Voice Privacy

- No chat-history tables were found in the MySQL migration.
- Private chat content, AI replies, voice transcripts, and emotion text remain request-local by design.
- Redis usage is limited to temporary operational state such as sessions, OTP/rate limits, OAuth state, and voice session metadata.
- Voice session Redis data uses hashed token metadata and TTL; raw audio and transcript text are not persisted.
- Logging is routed through sanitized logging patterns; the only app `console.log` hit is a local development API shim startup message.
- Admin surfaces do not expose private chat messages, AI replies, voice transcripts, or emotion profiles.
- `research_feedback` remains the intentionally persisted user-submitted feedback path and is separate from private chat.

## Dependency Security

- Frontend `pnpm audit --prod`: no known production npm vulnerabilities found after upgrade/overrides.
- Backend Maven tests and package build passed.
- Backend OWASP Dependency-Check was attempted but interrupted during unauthenticated NVD data update. Re-run with an NVD API key before production.

## Security Findings

- P1: Backend dependency CVE scan is incomplete without an NVD API key.
- P2: CSRF is disabled in Spring Security while cookie auth is used. Review before production and add a same-origin write guard if the deployment threat model requires it.
- P2: Production startup was not verified against real MySQL, Redis, OAuth, SMTP, and AI credentials in this temporary copy.
- P3: Frontend image warnings remain for `<img>` usage in visual-heavy pages.

## Positive Controls Observed

- CORS is configured from explicit allowed origins.
- Error responses avoid stack traces and exception details.
- Session cookies are HttpOnly, SameSite=Lax, and can be Secure in production through environment configuration.
- Realtime proxy route is production-disabled by default.
- Safety resources are configuration-backed and should be human-verified before release.
