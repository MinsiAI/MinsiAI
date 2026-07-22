# Changes Made

All changes below were made only in the temporary GitHub-preparation copy.

## Security And Dependencies

- Upgraded `next` and `eslint-config-next` from the 14.x line to the 15.5.x line.
- Added pnpm workspace overrides for `next > postcss` and `next > sharp` to remove remaining npm audit findings.
- Added pnpm build approvals for `unrs-resolver` and `sharp`.
- Migrated `pnpm run lint` from deprecated `next lint` to the ESLint CLI.

## Runtime Hardening

- Made the Realtime proxy route return 404 in production unless explicitly enabled by `MINSI_ENABLE_REALTIME_PROXY=true`.
- Updated the root layout for Next.js 15 async `cookies()` and `headers()`.
- Added `metadataBase` to root metadata.
- Replaced a missing login Open Graph image path with an existing runtime asset.

## Repository Hygiene

- Expanded `.gitignore` for environment files, keys, certificates, build output, caches, logs, database dumps, backups, uploads, and local tooling output.
- Added root `.env.example` and `backend/.env.example` with placeholders only.
- Rewrote `scripts/minsi-nextdev.sh` to avoid user-specific absolute paths.
- Removed generated/cached files and unreferenced generated icons listed in `REMOVED_FILES.md`.

## Documentation

- Replaced the old frontend-only README with full-stack setup, privacy boundary, validation, and production notes.
- Added acceptance, removal, possible-dead-code, security/privacy, and GitHub upload reports.
