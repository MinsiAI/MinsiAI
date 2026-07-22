# Minsi Backend Rules

> This file is the detailed reference for `docs/minsi-backend-skill.md`.
>
> Daily backend development should read the Quick Rules first. For Auth/Session, API paths, database schema, Redis, AI, voice, logging, CORS, safety resources, deployment, or environment-variable changes, read the matching section before coding.

---

## 0. Quick Rules

1. **聊天内容零持久化**：`message`、`reply`、`voice_transcript`、`emotion_text` 只能在当前请求内存中临时存在，绝对不写入 MySQL、Redis、日志、缓存、监控、trace、Sentry 或备份。
2. **禁止聊天记录系统**：不得创建 `chat_messages`、`conversations`、`chat_history`、`message_logs`、`ai_responses`、`transcript_history` 等表、字段、DTO、接口或 Redis key。
3. **技术栈锁定**：Java 21 + Spring Boot 3.x + Spring Security + MySQL 8.0 + MyBatis-Plus + Redis + Maven + Docker Compose + Nginx。
4. **Controller 薄层**：Controller 只做参数校验、调用 Service、返回 `ApiResponse`；不得直接操作数据库、Redis、邮件 SDK 或 AI SDK。
5. **AI 统一封装**：模型调用只允许走 `client/AiClient.java` 接口；Controller / Service 不得直接依赖具体模型供应商 SDK。
6. **Redis 只做临时状态**：Session hash、邮箱验证码 hash、限流、语音临时 token。禁止存聊天内容、AI 回复、语音转写、情绪文本、长期记忆。
7. **Auth 最小化**：MVP 只做邮箱验证码登录；不要求手机号、真实姓名、身份证、学校、年级、班级、城市、地区信息。
8. **Session 安全**：Cookie 只放高熵 `session_token`；Redis / MySQL 只保存 `session_hash`；JSON 响应不得返回 token、sessionId、原始 userId。
9. **日志脱敏**：只允许 `user_hash`、`ip_hash`、`email_hash`、endpoint、method、status_code、error_code、duration_ms、request_id；禁止原始 userId、email、IP、聊天原文、token、session。
10. **错误响应脱敏**：统一走 `common/ApiResponse` + `common/ErrorCode`；禁止暴露 stack trace、SQL、Java 类名、文件路径、模型供应商原始错误。
11. **越权防护**：涉及用户私有数据的查询必须使用 `currentUser.getUserId()` 或等价服务端认证上下文，不信任请求体中的 userId。
12. **医疗化禁止**：字段、路径、文案禁止出现 diagnosis、treatment、therapy_record、mental_health_label、psychological_assessment、emotion_profile 等医疗化命名。

---

## 1. 技术栈与目录

```txt
语言：Java 21
框架：Spring Boot 3.x + Spring Security
数据库：MySQL 8.0（utf8mb4，UTC）
ORM：MyBatis-Plus
缓存：Redis
构建：Maven
部署：Docker Compose + Nginx（香港或新加坡服务器）
AI：默认 Anthropic Claude API，统一走 AiClient 接口
前端：Next.js on Vercel（https://minsi.ai）
后端：Spring Boot on 自有服务器（https://api.minsi.ai）
CORS：生产允许 https://minsi.ai 和 https://www.minsi.ai，开发允许 http://localhost:3000，禁止 *
```

推荐目录：

```txt
controller/   AuthController UserController ChatController VoiceController ResearchController SafetyController ReportController
service/      AuthService SessionService UserService ChatService VoiceService ResearchService SafetyService RateLimitService EmailService
client/       AiClient ClaudeAiClient EmailClient
mapper/       UserMapper UserProfileMapper ResearchFeedbackMapper SafetyEventMapper ConsentRecordMapper
entity/       User UserProfile ResearchFeedback SafetyEvent ConsentRecord
dto/          auth/ chat/ user/ research/ safety/
common/       ApiResponse ErrorCode
config/       SecurityConfig RedisConfig MyBatisPlusConfig WebConfig
security/     CurrentUser SessionAuthFilter AuthContext
logging/      SanitizedLogger LogSanitizer
util/         HashUtils IpUtils TimeUtils ValidationUtils
```

禁止第一版引入 Spring Cloud、Nacos、Seata、Kafka、Kubernetes、微服务架构，或任何聊天记录系统。如需突破技术栈，必须先写 `docs/adr/*`。

---

## 2. API 路径规范

允许路径白名单：

```txt
POST  /api/auth/email/start          发送邮箱验证码
POST  /api/auth/email/verify         验证邮箱验证码并登录
POST  /api/auth/logout               退出登录
GET   /api/me                        当前用户基础信息
PATCH /api/me                        更新昵称、语言偏好
POST  /api/chat                      文字聊天，当前轮，不保存
POST  /api/voice/session             语音临时会话 token（Redis，TTL <= 30 分钟）
POST  /api/voice/transcribe          语音转文字，不保存
POST  /api/research/feedback         用户主动提交的研究反馈
GET   /api/safety/resources          紧急帮助资源（?lang=zh）
POST  /api/report                    用户主动反馈问题
```

禁止路径：

```txt
✗ /api/conversations       ✗ /api/messages          ✗ /api/chat-history
✗ /api/save-chat           ✗ /api/save-message      ✗ /api/chat-logs
✗ /api/transcript-history  ✗ /api/emotion-profile   ✗ /api/diagnosis
✗ /api/mental-health
```

禁止关键词：`save`、`history`、`record`、`message-log`、`conversation`、`diagnosis`、`mental-health`、`emotion-profile`、`transcript-history`。

---

## 3. 数据库规范

MVP 阶段默认只建以下表。`email_verification_codes` 和 `sessions` 默认不建，优先 Redis；只有明确需要审计或 Redis 备用方案时才建。

```txt
users                         必建
user_profiles                 必建
research_feedback             必建
safety_events                 必建
consent_records               必建
email_verification_codes      可选，默认不建，优先 Redis
sessions                      可选，默认不建，优先 Redis
```

### `users`

`email` 是唯一允许持久化的登录标识。返回前端时必须脱敏；日志、Redis key、限流 key 只能使用 `email_hash = SHA-256(email + HASH_SALT)`。

```sql
CREATE TABLE users (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  email          VARCHAR(255) NOT NULL UNIQUE,
  auth_provider  VARCHAR(32) NOT NULL DEFAULT 'email',
  status         VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at  DATETIME NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

禁止加入：真实姓名、手机号、身份证号、学校、年级、班级、城市、地区、IP、心理标签、情绪画像、诊断结果。

### `user_profiles`

```sql
CREATE TABLE user_profiles (
  user_id             BIGINT PRIMARY KEY,
  nickname            VARCHAR(64) NULL,
  preferred_language  VARCHAR(16) NOT NULL DEFAULT 'zh',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `research_feedback`

`/api/research/feedback` 是唯一允许持久化用户主动文本内容的接口，必须与聊天系统完全分离，默认不公开，人工审核后匿名展示。

```sql
CREATE TABLE research_feedback (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id        BIGINT NULL,
  rating         VARCHAR(64) NOT NULL,
  feedback_type  VARCHAR(64) NULL,
  feedback_text  TEXT NULL,
  is_approved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_research_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

禁止把聊天消息、AI 回复、语音转写、情绪诊断、位置、学校信息写入此表。

### `safety_events`

危机状态只记录事件类型、等级、时间和脱敏 metadata。不得记录触发内容、诊断结论、高危用户持久标签；后端不得主动通知家长或学校。

```sql
CREATE TABLE safety_events (
  id                 BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id            BIGINT NULL,
  event_type         VARCHAR(64) NOT NULL,
  severity           VARCHAR(32) NOT NULL,
  metadata_redacted  JSON NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_safety_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### `consent_records`

```sql
CREATE TABLE consent_records (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  consent_type  VARCHAR(64) NOT NULL,
  version       VARCHAR(32) NOT NULL,
  accepted_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_consent_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Optional Tables

```sql
CREATE TABLE email_verification_codes (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  email_hash     VARCHAR(128) NOT NULL,
  code_hash      VARCHAR(255) NOT NULL,
  expires_at     DATETIME NOT NULL,
  consumed_at    DATETIME NULL,
  attempt_count  INT NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_hash (email_hash),
  INDEX idx_expires_at (expires_at)
);
```

```sql
CREATE TABLE sessions (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  session_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at    DATETIME NOT NULL,
  revoked_at    DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_session_hash (session_hash),
  INDEX idx_expires_at (expires_at)
);
```

禁止表和字段：

```txt
✗ chat_messages        ✗ conversations          ✗ chat_history
✗ message_logs         ✗ ai_responses           ✗ full_user_input
✗ voice_transcript_history                       ✗ voice_records
✗ emotion_text         ✗ emotion_profile         ✗ user_emotions
✗ mental_health_labels ✗ diagnosis               ✗ psychological_assessment
✗ therapy_record       ✗ treatment_plan
✗ city / region / ip_address / school / grade / class
```

---

## 4. Auth / Session

MVP 阶段只实现邮箱验证码登录。预留微信/QQ OAuth 占位，暂不实现。禁止手机号登录、实名登录、身份证认证。

发送验证码：

```txt
1. 校验邮箱格式
2. email_hash = SHA-256(email + HASH_SALT)
3. ip_hash = SHA-256(ip + HASH_SALT)
4. 对 ip_hash 和 email_hash 限流
5. 生成 6 位验证码
6. code_hash = SHA-256(code + HASH_SALT)
7. Redis 写 otp:email:{email_hash}，TTL <= 10 分钟
8. value 只存 code_hash、attempt_count、created_at
9. 发送邮件（EmailClient）
10. 返回温和成功提示，不暴露验证码状态细节
```

验证登录：

```txt
1. 校验邮箱和验证码格式
2. 读取 Redis 中的 code_hash，校验 attempt_count
3. 验证通过后创建或更新 users
4. 使用 SecureRandom 生成至少 32 bytes 随机值，并用 Base64URL no-padding 编码为 session_token
5. session_hash = SHA-256(session_token + HASH_SALT)
6. Redis 只存 session:{session_hash} -> user_id, expires_at
7. Cookie 只放 session_token，不放 session_hash、userId、email
8. 删除验证码临时状态
```

Cookie 规则：

```txt
HttpOnly: true
Secure: production 必须 true
SameSite: Lax
Path: /
Domain: 使用 COOKIE_DOMAIN
```

退出登录必须删除 Redis session 并清除 Cookie。

---

## 5. AI / 聊天

`POST /api/chat` 只做当前轮转发：

```txt
前端 message -> ChatController -> ChatService -> AiClient -> 返回 reply -> 内存释放
```

允许：

```txt
✓ 当前请求内存中临时处理
✓ 返回 safetyLevel: normal / elevated / crisis
✓ crisis 时返回安全资源，记录 safety_events（不含触发内容）
```

禁止：

```txt
✗ message / reply 写入 MySQL、Redis、日志、Sentry、trace
✗ clientSessionId 用作长期用户标识
✗ Controller / Service 直接 import 具体模型供应商 SDK
✗ System Prompt 暴露给前端或日志
```

System Prompt 必须包含“Minsi 不是医生或心理治疗师”的边界说明，但不得硬编码在 Controller。

---

## 6. 语音

语音临时 session token 只存 hash，TTL <= 30 分钟：

```txt
voice:session:{token_hash} -> user_id, expires_at
```

`POST /api/voice/transcribe` 只处理当前请求，结果只返回前端，不写入 MySQL、Redis、日志、Sentry 或 trace。

---

## 7. Redis

只允许这些 key 形态：

```txt
session:{session_hash}              -> user_id, expires_at
otp:email:{email_hash}              -> code_hash, attempt_count, created_at
rate:ip:{ip_hash}:{endpoint}        -> counter
rate:user:{user_hash}:{endpoint}    -> counter
voice:session:{token_hash}          -> user_id, expires_at
```

禁止 key：

```txt
✗ chat:{userId}      ✗ message:{userId}    ✗ history:{userId}
✗ emotion:{userId}   ✗ transcript:{userId}
```

---

## 8. 日志与错误

所有日志必须通过 `logging/SanitizedLogger.java` 或等价脱敏封装。禁止 `System.out.println`。

允许字段：

```txt
user_hash = SHA-256(userId + HASH_SALT)
ip_hash = SHA-256(ip + HASH_SALT)
email_hash = SHA-256(email + HASH_SALT)
endpoint、method、status_code、error_code、duration_ms、request_id
```

禁止字段：

```txt
聊天原文、AI 回复、验证码、token、session_id、session_token
原始 user_id、原始 IP、原始 email
voice_transcript、emotion_text
数据库连接字符串、API Key、HASH_SALT
```

错误响应统一：

```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "请求太频繁，请稍后再试。"
  }
}
```

禁止返回 stack trace、SQL、Java 类名、文件路径、token、sessionId、原始 userId、原始 IP、模型供应商原始错误。

---

## 9. 环境变量与配置

`application.yml` 只允许环境变量占位，禁止写真实密钥。

```yaml
spring:
  datasource:
    url: ${MYSQL_URL}
    username: ${MYSQL_USERNAME}
    password: ${MYSQL_PASSWORD}
  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT}
      password: ${REDIS_PASSWORD}

minsi:
  ai:
    anthropic-api-key: ${ANTHROPIC_API_KEY}
  mail:
    smtp-host: ${SMTP_HOST}
    smtp-port: ${SMTP_PORT}
    smtp-username: ${SMTP_USERNAME}
    smtp-password: ${SMTP_PASSWORD}
  app:
    allowed-origins: ${ALLOWED_ORIGINS}
    cookie-domain: ${COOKIE_DOMAIN}
    cookie-secure: ${COOKIE_SECURE}
  security:
    hash-salt: ${HASH_SALT}
```

必需变量：

```txt
MYSQL_URL、MYSQL_USERNAME、MYSQL_PASSWORD
REDIS_HOST、REDIS_PORT、REDIS_PASSWORD
ANTHROPIC_API_KEY
SMTP_HOST、SMTP_PORT、SMTP_USERNAME、SMTP_PASSWORD
ALLOWED_ORIGINS
COOKIE_DOMAIN、COOKIE_SECURE
HASH_SALT
SPRING_PROFILES_ACTIVE
```

`HASH_SALT` 必须是高熵随机字符串，禁止提交。`.env` 和所有密钥禁止提交到代码仓库。

---

## 10. CORS

使用 Spring profile，不使用 `NODE_ENV`。

生产环境（`SPRING_PROFILES_ACTIVE=prod`）：

```txt
ALLOWED_ORIGINS=https://minsi.ai,https://www.minsi.ai
禁止 Access-Control-Allow-Origin: *
禁止 http://minsi.ai 和 http://www.minsi.ai
允许 credentials: true
```

开发环境（`SPRING_PROFILES_ACTIVE=dev`）：

```txt
ALLOWED_ORIGINS=http://localhost:3000
不得将开发配置带入生产部署
```

允许方法：GET、POST、PATCH、DELETE、OPTIONS。

---

## 11. 限流

限流统一在 `RateLimitService`，Redis key 使用 hash，不存原始 IP 和邮箱。

| 接口 | 限制 | 窗口 |
|------|------|------|
| `/api/auth/email/start` | 3次/IP | 1分钟 |
| `/api/auth/email/start` | 10次/邮箱 | 1小时 |
| `/api/auth/email/verify` | 5次/IP | 15分钟 |
| `/api/chat` | 30次/用户 | 1分钟 |
| `/api/voice/transcribe` | 10次/用户 | 1分钟 |
| `/api/research/feedback` | 3次/用户 | 1小时 |
| `/api/report` | 5次/用户 | 1小时 |

超限统一返回 `RATE_LIMITED`，不得返回内部限流细节。

---

## 12. 安全资源

`GET /api/safety/resources?lang=zh` 返回静态资源列表，不查用户数据，不通过 IP 精确定位，支持 `zh` / `en`。

资源维护在 `safety/safety-resources.yml`，不硬编码在 Controller 或 Route Handler。

示例只能使用占位符，不能放可被误认为已核实的真实热线：

```yaml
zh:
  - id: cn-crisis-resource-placeholder
    name: "待人工核实的本地危机支持资源"
    phone: "PLACEHOLDER_DO_NOT_DEPLOY"
    available: "NEEDS_HUMAN_VERIFICATION"
en:
  - id: global-crisis-resource-placeholder
    name: "Human-verified local crisis resource required"
    contact: "PLACEHOLDER_DO_NOT_DEPLOY"
    available: "NEEDS_HUMAN_VERIFICATION"
```

上线前必须由人工核实资源名称、联系方式、适用地区、可用时间和免责声明；未经核实不得部署。

---

## 13. 部署

```txt
服务器：      香港或新加坡
后端：        Docker 容器运行 Spring Boot JAR
数据库：      MySQL 8.0，不开放公网 3306，只允许后端内网访问
缓存：        Redis，不开放公网 6379，必须设密码
反向代理：    Nginx
HTTPS：       Let's Encrypt 或云厂商证书
```

Docker Compose 服务：`minsi-backend`、`mysql`、`redis`、`nginx`。

MySQL 生产要求：强密码、最小权限账号、定期备份、慢查询监控。

---

## 14. ADR 触发条件

以下情况必须新增 ADR：

```txt
切换数据库/ORM
引入 Spring Cloud、消息队列、微服务、Kubernetes
引入新 AI 供应商
新增 API 路径或新增数据库表
改变隐私承诺
改变日志策略
改变部署架构
```

建议目录：

```txt
docs/adr/
  0001-java-springboot-over-nextjs-route-handlers.md
  0002-mysql-over-supabase.md
  0003-no-chat-persistence.md
  0004-redis-session.md
  0005-ai-client-abstraction.md
```

---

## 15. 最小验收清单

```txt
□ API 路径在白名单中，不含禁止关键词
□ 没有创建聊天记录表、黑名单字段、黑名单 DTO 或黑名单 Redis key
□ message / reply / voice_transcript / emotion_text 未写入 MySQL、Redis、日志、Sentry、trace
□ Controller 未直接操作数据库、Redis、邮件 SDK、具体 AI SDK
□ AI 调用统一走 AiClient 接口
□ Mapper 查询用户私有数据使用 currentUser.getUserId()
□ Redis 仅用于 Session hash、验证码 hash、限流、语音临时 token
□ Cookie 放 session_token（高熵），Redis / MySQL 只存 session_hash
□ session_token 使用 SecureRandom 至少 32 bytes + Base64URL no-padding 生成
□ 日志只含 hash 标识和操作元数据，不含原始敏感信息
□ 错误响应不含 stack trace、SQL、Java 类名、文件路径、供应商原始错误
□ Cookie HttpOnly，生产 Secure，SameSite=Lax
□ 密钥和 HASH_SALT 只通过环境变量注入
□ CORS 使用 ALLOWED_ORIGINS 和 Spring profile，生产禁止 *
□ 安全资源没有未核实真实热线，占位资源不得上线
□ mvn test 通过
□ mvn package 通过
```

---

Minsi Backend Rules · Java backend reference · Privacy is an architecture constraint.
