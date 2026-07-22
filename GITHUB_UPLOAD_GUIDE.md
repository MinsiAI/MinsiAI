# GitHub Upload Guide

Prepared directory:

```bash
/private/tmp/minsi-ai-github-ready-20260722-103630
```

## Before Upload

Run:

```bash
git status
git log --oneline -1
git remote -v
```

Expected state:

- Branch: `main`
- Working tree: clean
- Remote: none configured
- Real `.env` files: absent
- Dependency/build/cache directories: absent from tracked files

## Create A GitHub Repository

Create an empty repository on GitHub, then add it as a remote:

```bash
git remote add origin git@github.com:YOUR_ORG/YOUR_REPO.git
git push -u origin main
```

No remote was added and no push was performed during this preparation.

## Recommended First GitHub Checks

After upload, configure CI to run:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run build
cd backend && mvn test && mvn -DskipTests package
```

For backend dependency CVE scanning, run OWASP Dependency-Check or an equivalent scanner with an NVD API key.
