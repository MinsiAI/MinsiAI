---
name: minsi-backend
description: Use when developing, reviewing, scaffolding, or modifying Minsi.ai Java Spring Boot backend code, including APIs, Auth/Session, MySQL schema, Redis state, AI chat or voice integrations, logging, safety resources, CORS, deployment, backend security, or backend environment variables. Enforce Minsi's privacy rule that chat content, AI replies, voice transcripts, and emotion text are never persisted.
---

# Minsi Backend Skill

This is the project-level Skill entrypoint for Minsi.ai backend work.

If this file is installed as a Codex Skill, place it at `minsi-backend/SKILL.md`. Keep `minsi-backend/references/backend-rules.md` available in the repo as the detailed reference.

## First Read

For every Minsi backend task:

1. Read `minsi-backend/references/backend-rules.md` before writing code.
2. Read the files directly involved in the task: Controller, Service, Mapper, DTO, config, or deployment files.
3. If the task touches Auth/Session, database schema, API routes, AI, voice, logs, CORS, safety resources, deployment, or environment variables, use the matching reference section in `minsi-backend/references/backend-rules.md`.

## Non-Negotiables

- Chat content is zero-persistence. Never write `message`, `reply`, `voice_transcript`, or `emotion_text` to MySQL, Redis, logs, analytics, cache, traces, Sentry, or backups.
- Never create chat history features, tables, endpoints, DTOs, or Redis keys.
- Keep the backend stack locked to Java 21, Spring Boot 3.x, Spring Security, MySQL 8.0, MyBatis-Plus, Redis, Maven, Docker Compose, and Nginx unless an ADR is created first.
- Controllers stay thin: validate input, call Services, return `ApiResponse`. They must not directly access MySQL, Redis, AI SDKs, or mail SDKs.
- AI calls go through `client/AiClient.java`. Controllers and Services must not depend on vendor SDKs directly.
- Redis is temporary state only: session hash, email-code hash, rate limits, voice temporary token. It must not store chat content, AI replies, transcripts, emotion text, or recoverable conversation state.
- Session cookies contain only a high-entropy `session_token`. Redis or MySQL stores only `session_hash`, never the original token.
- Logs must be sanitized. Only hashed identifiers and operational metadata are allowed.
- User-private queries must use `currentUser.getUserId()` or equivalent server-side auth context. Never trust a request-body `userId`.
- Naming must avoid medicalized concepts such as diagnosis, treatment, therapy record, mental health label, psychological assessment, or emotion profile.

## Workflow

1. Classify the change: API, Auth, schema, Redis, AI, voice, logs, safety, deployment, or ordinary service code.
2. Check the requested API path and data fields against the whitelist and blacklist in `minsi-backend/references/backend-rules.md`.
3. Design the smallest change that preserves zero persistence of chat content.
4. Implement with the local layering rules: Controller -> Service -> Mapper/Client.
5. Check for leaks in logs, exceptions, API responses, Redis values, SQL schema, tests, fixtures, and config.
6. Run `mvn test` and `mvn package` for backend changes when a Maven backend exists.
7. Report any validation that could not be run.

## When to Stop and Ask

Ask before proceeding if the user requests any of these:

- Saving chat history, recovering past conversations, or building long-term memory.
- Persisting voice transcripts, emotion text, model replies, or raw prompts.
- Adding medical diagnosis, treatment, psychological assessment, therapy, school, class, city, region, or raw IP fields.
- Loosening CORS to wildcard origins in production.
- Returning session tokens, raw user IDs, raw emails, or raw IP addresses in JSON.
- Using a different backend stack without an ADR.

## Review Checklist

Before finalizing backend code, verify:

- API route is allowed and does not contain forbidden keywords.
- No blacklisted table, field, DTO, Redis key, or endpoint was introduced.
- `message`, `reply`, `voice_transcript`, and `emotion_text` are request-local only.
- Logs use `SanitizedLogger` or equivalent and contain no raw user data or chat content.
- Errors do not reveal stack traces, SQL, Java class names, file paths, tokens, sessions, or vendor raw errors.
- Cookies are `HttpOnly`; production cookies are `Secure`; `SameSite=Lax`.
- CORS uses explicit configured origins, never `*`.
- Secrets and `HASH_SALT` come only from environment variables.
- Safety resources are human-verified before production deployment.
