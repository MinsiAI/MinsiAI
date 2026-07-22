---
name: minsi-admin
description: Use when designing, reviewing, scaffolding, or modifying Minsi.ai admin/back-office features, including admin authentication, RBAC, research feedback moderation, report triage, safety-resource management, audit logs, admin APIs under /api/admin/*, or admin frontend routes. Enforce that admins can never view, persist, export, search, or reconstruct private chat messages, AI replies, voice transcripts, emotion text, or chat-derived user profiles.
---

# Minsi Admin Skill

This is the project-level Skill entrypoint for Minsi.ai admin and back-office work.

Admin features are a control plane for moderation and operations. They are not a way to browse private user conversations.

## First Read

For every Minsi admin task:

1. Read `minsi-backend/SKILL.md`.
2. Read `minsi-backend/references/backend-rules.md`.
3. Read `minsi-admin/references/admin-rules.md`.
4. Read the files directly involved in the task: admin frontend route, backend Controller, Service, Mapper, DTO, entity, migration, config, or test.

If an admin task touches Auth, RBAC, database schema, audit logs, report handling, feedback review, safety resources, CORS, cookies, deployment, or environment variables, use the matching section in `minsi-admin/references/admin-rules.md` before coding.

## Non-Negotiables

- Admins must never view, search, export, persist, or reconstruct `message`, `reply`, `voice_transcript`, `emotion_text`, chat prompts, model replies, or chat-derived profiles.
- Do not create admin chat history, conversation review, message search, transcript review, emotion dashboard, diagnosis, treatment, therapy, or psychological assessment features.
- Admin work must not weaken `minsi-backend/references/backend-rules.md`. If rules conflict, stop and clarify instead of bypassing privacy constraints.
- Admin authentication is separate from normal user authentication. Do not treat a normal user session as an admin session.
- Admin APIs stay under `/api/admin/*`, except shared public health/status endpoints.
- Admin writes must create sanitized audit logs. Audit logs must not include private chat content, raw tokens, raw IPs, raw emails in application logs, or before/after snapshots containing user text.
- Research feedback is the only user-submitted long text that admins may review, and only because the user submitted it through the feedback channel. It must stay separate from chat.
- Safety resources require human verification before publication. Do not deploy placeholders or unverified real hotline data as production-ready resources.

## Workflow

1. Classify the admin surface: admin auth, RBAC, feedback moderation, report triage, safety resources, audit logs, dashboard, or deployment.
2. Check the requested route, API path, database table, DTO, and log fields against `minsi-admin/references/admin-rules.md` and `minsi-backend/references/backend-rules.md`.
3. Design the smallest change that solves the admin task without exposing private chat data.
4. Implement with the local layering rules: Controller -> Service -> Mapper/Client. Keep Controllers thin.
5. For frontend work, use the existing Next.js patterns and shared API request layer. Do not add page-local fetch conventions unless the codebase already uses them for that surface.
6. Add or update tests for authorization, forbidden access, moderation state changes, and audit-log creation when behavior changes.
7. Search for privacy leaks in routes, DTOs, SQL, Redis keys, logs, fixtures, tests, and frontend state.
8. Report validation commands, passed checks, skipped checks, and any residual risk.

## When to Stop and Ask

Ask before proceeding if the user requests any of these:

- Admin access to chats, chat history, prompts, AI replies, voice transcripts, emotion text, or user emotional profiles.
- Exporting raw user-submitted text at scale.
- Admin impersonation of users.
- Storing raw session tokens, raw IPs, raw user emails in logs, or raw admin session tokens anywhere.
- Adding medicalized workflows such as diagnosis, treatment, therapy record, psychological assessment, or mental-health labels.
- Adding admin APIs or tables that are not covered by the admin rules and no ADR/update path is provided.
- Loosening CORS, cookie, or production security settings for admin convenience.

## Review Checklist

Before finalizing admin code, verify:

- The feature is operational/admin scope, not private chat access.
- The admin route and API path are allowed by `minsi-admin/references/admin-rules.md`.
- Normal user sessions cannot access admin APIs.
- Admin sessions cannot be confused with user sessions.
- RBAC checks happen server-side for every admin API.
- Admin writes create sanitized audit logs.
- Feedback moderation never publishes raw `feedback_text`; public display uses reviewed/redacted text only.
- Report triage stores only user-submitted report data, not hidden chat context.
- Safety resources are draft/review/publish controlled and human-verified before production.
- Logs and errors are sanitized.
- Tests and `rg` privacy searches were run or the reason is documented.
