# Minsi Admin Rules

> This file is the detailed reference for `minsi-admin/SKILL.md`.
>
> Admin development must also obey `minsi-backend/SKILL.md` and `minsi-backend/references/backend-rules.md`.

---

## 0. Quick Rules

1. **后台不是聊天查看器**：管理员不能查看、搜索、导出、保存或重建用户聊天、AI 回复、语音转写、情绪文本或聊天衍生画像。
2. **只管理运营对象**：后台只处理管理员账号、研究反馈审核、用户主动提交的 report、安全资源、审计日志和系统运行状态。
3. **管理员认证独立**：管理员登录态必须与普通用户登录态隔离，不能把普通 `session_token` 当作管理员凭证。
4. **服务端 RBAC**：所有 `/api/admin/*` 接口必须在服务端检查管理员身份和角色，前端隐藏按钮不能作为权限控制。
5. **写操作必须审计**：审核、驳回、发布、关闭、修改权限等后台写操作必须写入脱敏审计日志。
6. **审计日志不存内容快照**：审计日志只记录动作、目标类型、目标 ID、结果、脱敏标识和 request_id，不记录聊天内容、反馈全文、report 全文、token、原始 IP。
7. **研究反馈单独审核**：`research_feedback` 是唯一允许管理员查看的用户主动长文本渠道，且必须与聊天系统彻底隔离。
8. **公开展示必须脱敏**：匿名展示用户反馈时，只能使用人工审核后的 `display_text` / `redacted_text`，不能直接公开原始 `feedback_text`。
9. **安全资源人工核实**：热线、资源名称、适用地区、联系方式、可用时间和免责声明必须人工核实后才能发布。
10. **后台 API 独立命名**：后台接口统一放在 `/api/admin/*`，不要复用普通用户 API 做管理操作。

---

## 1. Admin Scope

允许后台管理的对象：

```txt
admin_users                 管理员账号
admin_roles / permissions   管理员角色和权限，MVP 可先用 role 字段
research_feedback           用户主动提交的研究反馈审核
reports                     用户主动提交的问题报告，若实现持久化
safety_resources            人工核实的安全资源，若从 YAML 演进到数据库
admin_audit_logs            管理员操作审计
system_status               只读运行状态，不含用户私密数据
```

禁止后台管理的对象：

```txt
chat_messages
conversations
chat_history
message_logs
ai_responses
voice_transcripts
emotion_profiles
diagnosis
treatment_plan
therapy_record
psychological_assessment
```

禁止后台页面：

```txt
✗ /admin/chats
✗ /admin/conversations
✗ /admin/messages
✗ /admin/transcripts
✗ /admin/emotions
✗ /admin/diagnosis
✗ /admin/mental-health
```

---

## 2. Admin Frontend Routes

推荐后台前端路由：

```txt
/admin/login                 管理员登录
/admin                       后台首页，只显示运营指标
/admin/feedback              研究反馈审核
/admin/reports               用户主动 report 处理
/admin/safety-resources      安全资源草稿、审核、发布
/admin/audit                 审计日志查询
/admin/settings              管理员设置，MVP 可不做
```

前端规则：

```txt
1. 后台页面不出现在普通用户主导航中，除非明确设计管理员入口。
2. 后台页面不能调用普通用户 Session 判断管理员身份，必须调用 GET /api/admin/me。
3. 后台前端只展示当前管理员角色允许的操作。
4. 权限判断必须以后端返回为准，前端只做体验优化。
5. 不在 localStorage、sessionStorage 或 URL 中存 admin token、session token、角色密钥。
6. 不在前端硬编码可发布的安全热线真实数据；真实资源来自后端或已审核配置。
```

---

## 3. Admin API Paths

后台接口统一使用 `/api/admin/*`。

### Auth

```txt
POST  /api/admin/auth/email/start       发送管理员邮箱验证码
POST  /api/admin/auth/email/verify      验证管理员邮箱验证码并登录
POST  /api/admin/auth/logout            退出管理员登录
GET   /api/admin/me                     当前管理员基础信息和角色
```

### Feedback Moderation

```txt
GET   /api/admin/research-feedback
GET   /api/admin/research-feedback/{id}
PATCH /api/admin/research-feedback/{id}
```

允许操作：

```txt
approve
reject
redact
unpublish
```

禁止操作：

```txt
把反馈关联到聊天内容
根据聊天上下文自动补全反馈
公开原始 feedback_text
```

### Report Triage

```txt
GET   /api/admin/reports
GET   /api/admin/reports/{id}
PATCH /api/admin/reports/{id}
```

允许状态：

```txt
open
reviewing
resolved
dismissed
```

Report 只能包含用户主动提交的问题描述、分类、提交时间和脱敏上下文。不得附带隐藏聊天上下文、AI 回复、语音转写或情绪文本。

### Safety Resources

```txt
GET   /api/admin/safety-resources
POST  /api/admin/safety-resources
PATCH /api/admin/safety-resources/{id}
POST  /api/admin/safety-resources/{id}/submit-review
POST  /api/admin/safety-resources/{id}/publish
POST  /api/admin/safety-resources/{id}/archive
```

发布前必须记录：

```txt
resource_name
contact_method
region
language
available_hours
source_url_or_note
verified_by_admin_id
verified_at
disclaimer
```

### Audit Logs

```txt
GET   /api/admin/audit-logs
```

审计日志查询必须分页，默认按时间倒序。不得支持全文搜索用户原文。

### System Status

```txt
GET   /api/admin/system/status
```

只能返回运行状态，例如服务健康、数据库连接状态、Redis 连接状态、构建版本、最近部署时间。禁止返回密钥、环境变量值、连接字符串、用户私密数据或聊天统计。

---

## 4. Admin Auth and Session

MVP 推荐邮箱验证码登录，管理员账号预先由数据库种子或人工 SQL 创建，不开放公开注册。

Cookie 推荐：

```txt
Name: admin_session_token
HttpOnly: true
Secure: production 必须 true
SameSite: Lax
Path: /
Domain: 使用 COOKIE_DOMAIN
```

Redis 推荐：

```txt
admin:session:{session_hash} -> admin_user_id, role, expires_at
admin:otp:email:{email_hash} -> code_hash, attempt_count, created_at
admin:rate:ip:{ip_hash}:{endpoint} -> counter
admin:rate:admin:{admin_hash}:{endpoint} -> counter
```

禁止：

```txt
把普通用户 session:{session_hash} 作为管理员登录态
JSON 返回 admin_session_token、session_hash、原始 admin_user_id
日志输出管理员邮箱、token、验证码、原始 IP
用前端角色字段决定权限
```

管理员会话过期后必须清除 Cookie；退出登录必须删除 Redis admin session。

---

## 5. RBAC

MVP 角色建议：

```txt
owner          全部后台权限，含管理员管理
moderator      研究反馈审核和 report 处理
safety_editor  安全资源草稿和提交审核
safety_publisher 安全资源发布，建议与 editor 分离
auditor        只读审计日志
support_viewer 只读 report 列表，不能查看敏感文本细节
```

最小权限矩阵：

| Capability | owner | moderator | safety_editor | safety_publisher | auditor | support_viewer |
|---|---:|---:|---:|---:|---:|---:|
| View feedback queue | yes | yes | no | no | no | no |
| Moderate feedback | yes | yes | no | no | no | no |
| View reports | yes | yes | no | no | no | yes |
| Update report status | yes | yes | no | no | no | no |
| Edit safety resources | yes | no | yes | no | no | no |
| Publish safety resources | yes | no | no | yes | no | no |
| View audit logs | yes | no | no | no | yes | no |
| Manage admins | yes | no | no | no | no | no |

服务端必须使用注解、过滤器或显式 Service 检查角色。禁止只在前端控制按钮显示。

---

## 6. Database Guidance

新增后台表属于架构变化。实现前如果 `minsi-backend/references/backend-rules.md` 还没有覆盖对应表或 API，必须同步更新规则或新增 ADR。

### `admin_users`

```sql
CREATE TABLE admin_users (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  email          VARCHAR(255) NOT NULL UNIQUE,
  role           VARCHAR(64) NOT NULL,
  status         VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at  DATETIME NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

禁止加入手机号、身份证、真实姓名、家庭地址、聊天访问权限字段。

### `admin_audit_logs`

```sql
CREATE TABLE admin_audit_logs (
  id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id        BIGINT NULL,
  admin_user_hash      VARCHAR(128) NOT NULL,
  action              VARCHAR(128) NOT NULL,
  target_type         VARCHAR(64) NOT NULL,
  target_id           VARCHAR(128) NULL,
  result              VARCHAR(32) NOT NULL,
  request_id          VARCHAR(128) NOT NULL,
  ip_hash             VARCHAR(128) NULL,
  metadata_redacted   JSON NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_audit_created_at (created_at),
  INDEX idx_admin_audit_target (target_type, target_id),
  INDEX idx_admin_audit_admin (admin_user_hash)
);
```

`metadata_redacted` 只能保存操作元数据，例如 `from_status`、`to_status`、`field_names`。禁止保存用户文本原文、聊天内容、AI 回复、语音转写、token、邮箱、IP。

### `reports`

只有在 `/api/report` 需要持久化时才创建。Report 是用户主动提交的问题反馈，不是聊天记录容器。

```sql
CREATE TABLE reports (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id        BIGINT NULL,
  category       VARCHAR(64) NOT NULL,
  description    TEXT NULL,
  status         VARCHAR(32) NOT NULL DEFAULT 'open',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at    DATETIME NULL,
  reviewed_by_admin_id BIGINT NULL,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

禁止把 message、reply、voice_transcript、emotion_text、chat_context、conversation_id 写入 reports。

### Research Feedback Review Fields

当前后端规则里的 `research_feedback` MVP 表只有 `is_approved`。如果要支持后台脱敏展示，推荐用迁移新增：

```txt
review_status       pending / approved / rejected
display_text        人工审核后的匿名展示文本
reviewed_at
reviewed_by_admin_id
rejection_reason_code
```

禁止公开原始 `feedback_text`。禁止把聊天内容复制到 `display_text`。

### Safety Resources Storage

第一版可以继续使用 `safety/safety-resources.yml`。如果要做数据库后台管理，必须区分 draft/review/published/archive 状态，并保留人工核实字段。

禁止把未经核实的真实热线当作 production published 资源。

---

## 7. Logging and Errors

应用日志允许字段：

```txt
admin_user_hash
ip_hash
endpoint
method
status_code
error_code
duration_ms
request_id
```

应用日志禁止字段：

```txt
原始 admin_user_id
原始 admin email
admin_session_token
session_hash
验证码
原始 IP
用户聊天内容
AI 回复
voice_transcript
emotion_text
feedback_text
report description
```

错误响应禁止暴露：

```txt
stack trace
SQL
Java 类名
文件路径
token
sessionId
原始 userId
原始 adminUserId
原始 email
数据库连接字符串
环境变量值
```

---

## 8. Frontend Integration

后台前端可以放在同一个 Next.js 项目中，但必须和普通用户页面隔离。

推荐前端对接：

```txt
lib/api/http.ts                         复用统一请求层，credentials: include
lib/admin/admin-api.ts                  后台 API 封装
lib/admin/admin-session-api.ts          GET /api/admin/me、logout
components/admin/*                      后台组件
app/admin/*                             后台路由
```

后台登录流程：

```txt
1. /admin/login 提交邮箱
2. POST /api/admin/auth/email/start
3. 输入验证码
4. POST /api/admin/auth/email/verify
5. 成功后跳转 /admin 或 redirect 参数中的安全后台路径
6. GET /api/admin/me 校验登录态
```

禁止：

```txt
复用普通 /login 完成管理员登录
把管理员角色写死在前端
把 admin_session_token 放到 localStorage
在 URL query 中传 token
在普通用户页面直接暴露后台入口和后台数据
```

---

## 9. Deployment and Security

生产环境建议：

```txt
后台前端路由使用同一域名下 /admin，或独立 admin.minsi.ai
管理员 Cookie 使用 HttpOnly、Secure、SameSite=Lax
CORS 只允许明确后台域名和前端域名
后台登录和写操作限流
后台页面禁止被搜索引擎索引
后台错误页不显示内部实现
```

如果使用独立 `admin.minsi.ai`，必须明确配置：

```txt
ALLOWED_ORIGINS=https://admin.minsi.ai
COOKIE_DOMAIN=.minsi.ai 或更严格的 admin 专属域
```

不得为了后台调试把生产 CORS 改成 `*`。

---

## 10. Acceptance Checklist

每个后台阶段结束时输出：

```txt
1. 本阶段完成了哪些文件
2. 运行了哪些验收命令
3. 哪些验收通过
4. 哪些没有运行，为什么
5. 是否有任何违反 minsi-admin/references/admin-rules.md 或 minsi-backend/references/backend-rules.md 的风险
```

必须检查：

```txt
□ 后台功能没有暴露聊天、AI 回复、语音转写、情绪文本
□ 普通用户 session 不能访问 /api/admin/*
□ 管理员 session 与普通用户 session 隔离
□ 每个后台接口都有服务端 RBAC
□ 后台写操作创建脱敏审计日志
□ 日志不含 token、验证码、原始 IP、原始邮箱、用户文本
□ 反馈公开展示使用审核后的 display_text / redacted_text
□ report 没有保存隐藏聊天上下文
□ 安全资源发布前有人工作核实字段
□ 错误响应不暴露内部实现
□ 前端不在 localStorage、sessionStorage、URL 保存 token
```

推荐搜索验收：

```bash
rg -n "chat_messages|conversations|chat_history|message_logs|ai_responses|voice_transcript_history|emotion_profile|diagnosis|therapy_record|psychological_assessment|treatment_plan" backend minsi-admin app components lib
rg -n "/admin/(chat|chats|conversation|conversations|message|messages|transcript|transcripts|emotion|emotions|diagnosis|mental-health)" app components lib backend minsi-admin
rg -n "System\.out\.println|admin_session_token|session_token|user message|AI reply|voice_transcript|emotion_text|feedback_text|report description" backend/src app components lib minsi-admin
```

注意：这些关键词可能会在规则文档、测试名或 DTO 字段中合理出现。验收时不要只看有没有搜索结果，要判断是否是危险实现。

---

Minsi Admin Rules · Back-office reference · Admin is not a private-chat viewer.
