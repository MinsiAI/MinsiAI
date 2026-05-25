# Codex Workflow Rules

> 本文件只记录 Codex 工作流规则，不属于 Minsi.ai 前端设计规范。  
> 前端设计与组件规范见 `docs/minsi-codex-rules.md` 和 `docs/minsi-frontend-skill.md`。

---

## Command Output Discipline

Protect context usage without hiding important debugging information.

Rules:

- Do not dump large command outputs into the conversation by default.
- For commands with unknown or potentially large output, use targeted or capped output.
- Prefer `rg`, `sed -n`, `head`, and `tail` to read only relevant snippets.
- Preserve key errors, file paths, line numbers, and the failed command.
- For long logs, search for relevant keywords first, then read nearby context.

Common pattern:

```bash
COMMAND 2>&1 | head -c 4000
```

If the command exit code matters, avoid hiding it behind a pipeline. Use a more targeted command or inspect the relevant log file snippet instead.
