# Minsi Frontend Skill v1.1

> 本文档是 Minsi.ai 项目级前端开发规范，供 Codex、AI 代码生成工具和前端开发者强制遵守。  
> 作者：Minsi.ai 团队  
> 版本：v1.1  
> 状态：正式版  
> 更新日期：2026-05-19  
> 适用范围：Minsi.ai 官网、登录页、聊天页、关于页、隐私页、用户研究页及后续所有前端页面

---

## PART 0 · Quick Reference

> 本节优先级最高。每次生成代码前必须先检查本节。

### MUST

每次生成或修改代码前，必须确认：

```txt
□ 先阅读本文件 docs/minsi-frontend-skill.md
□ 先阅读首页设计基准文件 app/page.tsx、app/globals.css、components/site/*、public/assets/brand/*
□ 复用 MinsiLogo，不允许页面内单独写 Logo
□ 复用 SiteHeader，不允许每页重写 Header
□ 主按钮使用 MinsiButton，不允许裸写 <button> 作为主操作
□ 卡片使用 GlassCard，不允许手写 backdrop-filter 和圆角
□ 颜色使用 Design Token，不允许页面内写新的 hex 色值
□ 组件必须有 TypeScript Props 类型定义，不允许 props: any
□ 所有使用事件、状态、useState、useEffect 的组件顶部加 "use client"
□ prefers-reduced-motion 在 globals.css 统一处理，组件内不单独写
□ 移动端适配 safe-area-inset-bottom
□ 禁止横向滚动，overflow-x: hidden 在 body 或 .minsi-page 层处理
□ 图片使用 next/image，可能成为 LCP 的首屏图片加 priority
□ 每个页面配置 title、description、openGraph
□ 修改公共组件后必须检查首页 PC 和移动端视觉是否被破坏
```

### MUST NOT

以下任何一条违反，都必须重写：

```txt
□ 禁止写 dark: 前缀的 Tailwind class，v1.1 不支持 Dark Mode
□ 禁止把 token、session、uid 存入 localStorage
□ 禁止将聊天内容持久化到 localStorage、IndexedDB、Cookie 或任何本地存储
□ 禁止在页面或组件内随意写新 hex 色值，必须使用 Design Token
□ 禁止组件 props 无 TypeScript 类型
□ 禁止重新设计 Logo
□ 禁止每页单独写 Header
□ 禁止引入 Bootstrap、Ant Design、Material UI
□ 禁止高饱和绿色、蓝色、红色作为主色
□ 禁止横向滚动
□ 禁止错误页暴露技术堆栈
□ 禁止二维码区域透明背景，必须纯白
□ 禁止出现“保存聊天记录”“历史记录”“永久保存对话”等误导表达
□ 禁止把 Minsi.ai 设计成普通 SaaS、强科技感、强商业化页面
```

### 常用代码速查

```tsx
// 普通内容页
<SiteHeader />
<main className="minsi-shell">
  ...
</main>

// 登录页
<SiteHeader showNav={false} showLogin={false} />
<GlassCard intensity="medium" padding="lg">
  <MinsiButton variant="primary">安全进入</MinsiButton>
</GlassCard>

// 需要 "use client" 的组件顶部
"use client"
import type { FC } from "react"

// 温和错误文案
"验证码好像不太对，可以再检查一下。"
"页面好像暂时没有准备好，我们可以重新试一次。"
"连接好像断了，稍后再试一下。"
```

---

## PART 1 · 项目总原则

### 1.1 设计基准

当前首页代码是 Minsi.ai 所有页面的唯一设计基准。

首页设计基准文件包括：

- `app/page.tsx`
- `app/globals.css`
- `components/site/*`
- `public/assets/brand/*`

规则：

1. 所有页面必须继承首页设计系统，不得另起炉灶。
2. Figma 只作为布局结构和素材参考。
3. 颜色、Logo、Header、按钮、卡片、字体、动效、响应式规则必须以首页代码和本 Skill 为准。
4. 不允许根据新 Figma 页面重建另一套视觉语言。
5. 新页面开发顺序必须是：

```txt
先读 docs/minsi-frontend-skill.md
再读首页代码
再看 Figma Frame 或页面需求
列出可复用组件
生成代码
检查验收
```

如果 `app/page.tsx` 当前仍包含重复 Logo、重复 Header、裸 hex 色值、页面内玻璃卡片样式、未组件化按钮，则必须先重构首页为设计系统基准，再开发其他页面。

首页不是一次性页面代码，而是 Minsi.ai 后续页面的设计系统母版。

开发其他页面前，必须确认首页已经完成以下组件化：

- MinsiLogo
- SiteHeader
- MinsiButton
- GlassCard
- SafetyNotice

如果首页未完成组件化，不允许直接开发登录页、聊天页、关于页、隐私页或用户研究页。

### 1.2 页面气质

Minsi.ai 的页面气质必须保持：

- 温柔
- 安静
- 安全
- 轻盈
- 可信
- 不评判
- 有陪伴感

禁止：

- 强科技感
- 强商业感
- 普通 SaaS 风格
- 过度炫技
- 高饱和撞色
- 压迫式营销
- 医疗化承诺

### 1.3 产品承诺

Minsi.ai 的核心产品承诺：

- 聊天内容不保存
- 退出聊天后自动清除
- 不用真实姓名
- 不用手机号
- Minsi 不是医生或心理治疗师
- 如有危险想法，应联系可信赖的大人或专业机构

任何页面文案和功能设计都不能违背以上承诺。

### 1.4 基础工程约束

- PC 端和移动端必须自适应，不能写死 1920×1080
- 禁止横向滚动
- 所有页面支持 prefers-reduced-motion
- v1.1 不支持 Dark Mode，禁止写任何 dark: Tailwind class
- 公共组件优先复用，不允许重复造轮子

### 1.5 Dark Mode 禁用策略

v1.1 不支持 Dark Mode：

1. `:root` 必须设置 `color-scheme: light`。
2. `html` 不得添加 `.dark` class 或 `data-theme="dark"`。
3. 禁止所有组件中出现 `dark:` Tailwind class。
4. Tailwind v3 项目必须在 `tailwind.config.ts` 中设置 `darkMode: "selector"`。
5. Tailwind v4 项目如需保留 dark variant，必须用 `@custom-variant dark` 绑定 `.dark` class，不允许跟随系统 `prefers-color-scheme` 自动触发。
6. 因为当前项目不会给 `html` 添加 `.dark`，所以任何 dark variant 都不应在真实页面生效。

Tailwind v3 示例：

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

Tailwind v4 示例：

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

注意：文档仍然要保留“禁止写 `dark:` 前缀”的要求。配置层只是额外保险，不代表允许开发者写 `dark:` class。

---

## PART 2 · Design Tokens

所有视觉变量必须通过 Design Token 管理。  
禁止页面和组件中随意写新的 hex 色值。  
例外：Design Token 定义文件中允许出现 hex 色值。

### 2.1 Token 文件位置

建议放置位置：

```txt
styles/minsi-tokens.css
```

如果项目暂时没有 styles 目录，也可以放入：

```txt
app/globals.css
```

但必须用独立区块标记。

### 2.2 完整 Token 定义

```css
/* ============================================
   Minsi.ai Design Tokens v1.1
   修改此文件前必须同步更新：
   docs/minsi-frontend-skill.md
   命名规则：
   颜色    -> --minsi-{name}
   间距    -> --space-{size}
   圆角    -> --radius-{size}
   阴影    -> --shadow-{name}
   动效    -> --ease-{name} / --duration-{name}
   Z 层级  -> --z-{name}
   ============================================ */
:root {
  color-scheme: light;
  /* Colors */
  --minsi-bg: #FAF8F5;
  --minsi-bg-soft: #F5F2EE;
  --minsi-ink: #1C1A2E;
  --minsi-text: #2D2B45;
  --minsi-muted: #8A8BA8;
  --minsi-purple: #7C6FE0;
  --minsi-purple-soft: #A89FEA;
  --minsi-lavender: #EDE9FD;
  --minsi-card-bg: rgba(255, 255, 255, 0.60);
  --minsi-card-bg-strong: rgba(255, 255, 255, 0.80);
  --minsi-border: rgba(124, 111, 224, 0.18);
  --minsi-border-soft: rgba(124, 111, 224, 0.10);
  --minsi-focus: rgba(124, 111, 224, 0.40);
  --minsi-danger: #C0606A;
  --minsi-warning: #C08A40;
  --minsi-success: #5A9E7A;
  /* Spacing */
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;
  /* Shadow */
  --shadow-soft: 0 2px 12px rgba(28, 26, 46, 0.06);
  --shadow-card: 0 4px 24px rgba(28, 26, 46, 0.08), 0 1px 4px rgba(28, 26, 46, 0.04);
  --shadow-floating: 0 8px 40px rgba(28, 26, 46, 0.12), 0 2px 8px rgba(28, 26, 46, 0.06);
  --shadow-button: 0 4px 16px rgba(124, 111, 224, 0.28);
  --shadow-focus: 0 0 0 3px var(--minsi-focus);
  /* Motion */
  --ease-gentle: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-soft: cubic-bezier(0.0, 0, 0.2, 1);
  --duration-fast: 160ms;
  --duration-base: 320ms;
  --duration-slow: 500ms;
  --duration-breathing: 3200ms;
  /* Z-index */
  --z-base: 0;
  --z-decor: 1;
  --z-content: 10;
  --z-header: 100;
  --z-dropdown: 200;
  --z-modal: 300;
  --z-toast: 400;
  --z-tooltip: 500;
}
```

### 2.3 Token 使用规则

正确：

```css
.card {
  background: var(--minsi-card-bg);
  color: var(--minsi-ink);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}
```

错误：

```css
.card {
  background: rgba(255, 255, 255, 0.6);
  color: #1C1A2E;
  border-radius: 24px;
}
```

说明：

- Design Token 定义文件可以写 hex。
- 业务组件、页面样式、Tailwind 任意值中禁止新增裸 hex。
- 如果必须新增颜色，先加入 Token，再使用 Token。

---

## PART 3 · 全局 CSS 基础

### 3.1 基础页面类

必须在全局 CSS 中提供以下类：

```css
html {
  background: var(--minsi-bg);
}
body {
  margin: 0;
  min-height: 100svh;
  overflow-x: hidden;
  background: var(--minsi-bg);
  color: var(--minsi-text);
}
.minsi-page {
  min-height: 100svh;
  overflow-x: hidden;
  background: var(--minsi-bg);
}
.minsi-shell {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  padding-inline: clamp(16px, 5vw, 80px);
}
.minsi-section {
  padding-block: clamp(40px, 8vw, 96px);
}
.minsi-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
```

### 3.2 Safe Area

移动端底部必须适配安全区域：

```css
.minsi-safe-bottom {
  padding-bottom: max(var(--space-lg), env(safe-area-inset-bottom));
}
```

聊天页输入框底部必须使用 safe area。

### 3.3 Reduced Motion

统一在 globals.css 中处理：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

组件内部不要重复写 prefers-reduced-motion。

---

## PART 4 · 组件规范

### 4.1 Server / Client 组件边界

必须加 `"use client"` 的组件：

- SiteHeader，含汉堡菜单状态
- LanguageSwitch，含 onChange 事件
- MinsiButton，含 onClick、loading 状态
- QRLoginCard，含轮询、状态机
- ErrorBoundary
- CookieBanner
- ConfirmModal
- ChatInput
- VoiceButton
- 所有含 useState、useEffect、事件处理的组件

可以是 Server Component 的组件：

- 页面骨架 app/page.tsx
- SafetyNotice 纯展示版
- 静态文案区块
- SEO metadata 生成
- 普通 GlassCard 展示版

如果 GlassCard 只负责展示，可以作为 Server Component。  
如果 GlassCard 需要 onClick、状态、动画控制，则拆成 Client 版本或在组件顶部加 `"use client"`。

### 4.2 TypeScript Props 接口

所有组件必须定义 Props 接口或类型定义。  
禁止使用 `props: any`。

#### MinsiLogo

```ts
interface MinsiLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
}
```

要求：

- 默认 href 为 `/`
- 默认 size 为 `md`
- 必须使用 `/assets/brand/minsi-logo.svg`
- 禁止页面内单独写 Logo
- 禁止重新设计 Logo

#### SiteHeader

```ts
interface SiteHeaderProps {
  showNav?: boolean;
  showLogin?: boolean;
  transparent?: boolean;
  lang?: "zh" | "en";
  className?: string;
}
```

要求：

- 默认 showNav 为 true
- 默认 showLogin 为 true
- 默认 lang 为 `zh`
- 所有页面必须复用 SiteHeader
- 登录页可使用 `showNav={false} showLogin={false}`

#### LanguageSwitch

```ts
interface LanguageSwitchProps {
  lang?: "zh" | "en";
  onChange?: (lang: "zh" | "en") => void;
  compact?: boolean;
  className?: string;
}
```

#### MinsiButton

```ts
type MinsiButtonBaseProps = {
  variant?: "primary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type MinsiButtonAsButton = MinsiButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type MinsiButtonAsLink = MinsiButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type MinsiButtonProps = MinsiButtonAsButton | MinsiButtonAsLink;
```

要求：

- href 不存在时渲染为 button
- href 存在时渲染为 Link 或 a
- button 模式必须支持 type、disabled、aria-*、onFocus、onKeyDown 等原生属性
- link 模式必须支持 target、rel、aria-* 等原生属性
- 主操作按钮必须使用 MinsiButton
- 禁止裸写主操作 button

#### GlassCard

```ts
interface GlassCardProps {
  children: React.ReactNode;
  intensity?: "soft" | "medium" | "strong";
  padding?: "sm" | "md" | "lg";
  clickable?: boolean;
  className?: string;
}
```

要求：

- 默认 intensity 为 `medium`
- 默认 padding 为 `md`
- 普通卡片必须使用 GlassCard
- 禁止页面内手写重复的玻璃拟态样式

#### SafetyNotice

```ts
interface SafetyNoticeProps {
  variant?: "inline" | "card" | "footer";
  children?: React.ReactNode;
  className?: string;
}
```

要求：

- 用于说明聊天不保存、Minsi 不是医生、危险情况下联系可信赖大人或专业机构
- 可以作为 Server Component

#### AuthCard

```ts
interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}
```

#### QRLoginCard

```ts
type QRProvider = "wechat" | "qq";
type QRStatus = "loading" | "active" | "expired" | "scanned" | "confirmed" | "error";

interface QRLoginCardProps {
  provider: QRProvider;
  qrSrc: string;
  status?: QRStatus;
  expiresIn?: number; // 单位：秒，例如 116 表示 116 秒后过期
  onRefresh?: () => void;
  className?: string;
}
```

说明：

- expiresIn 一律使用 seconds，不允许传 milliseconds。
- 二维码倒计时展示层负责格式化。
- 接口如果返回毫秒，必须在数据层转换为秒后再传入 QRLoginCard。

---

## PART 5 · 组件文件结构

项目组件结构应保持清晰：

```txt
components/
  site/
    MinsiLogo.tsx
    SiteHeader.tsx
    LanguageSwitch.tsx
    MinsiButton.tsx
    GlassCard.tsx
    SafetyNotice.tsx
    index.ts
  login/
    AuthCard.tsx
    QRLoginCard.tsx
    EmailLoginForm.tsx
    index.ts
  chat/
    ChatInput.tsx
    ChatMessage.tsx
    VoiceButton.tsx
    EmergencyHelp.tsx
    ConfirmClearModal.tsx
    index.ts
  shared/
    ErrorBoundary.tsx
    CookieBanner.tsx
    ConfirmModal.tsx
    index.ts
  home/
    ...
  about/
    ...
  privacy/
    ...
  research/
    ...
```

规则：

- site 目录放跨页面公共组件
- home 目录只放首页专用组件
- about、privacy、research 放页面专用组件
- 禁止把页面专用组件塞进 site
- 禁止把公共 Header、Logo、Button 在页面里重写

---

## PART 6 · 视觉规范

### 6.1 颜色

统一使用 PART 2 的 Design Token。

特别注意：

- 微信绿 `#07C160` 禁止作为主按钮色，只能作为小图标点缀
- QQ 蓝 `#12B7F5` 禁止作为主按钮色，只能作为小图标点缀
- 错误色使用 `--minsi-danger`，禁止鲜红 `#FF0000` 或 `#EF4444`
- 页面主色只能围绕奶白、薰衣草紫、深蓝黑、柔和灰紫展开

### 6.2 字体

必须用 next/font。  
禁止用裸 `<link>` 引入 Google Fonts。

示例：

```ts
import { Noto_Sans_SC } from "next/font/google"

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto",
  preload: false,
})
```

说明：

- 中文字体不指定 subsets，避免错误限制为 latin
- 中文字体不预加载，避免首屏字体体积过大
- 英文品牌字样使用 Logo SVG，不依赖网页字体
- `display: "swap"` 避免字体加载造成明显闪烁
- CLS 控制在 0.1 以内

字号规范：

- 主标题 PC：48px 到 64px
- 主标题移动端：clamp(28px, 7vw, 52px)
- 副标题 PC：28px 到 36px
- 副标题移动端：clamp(20px, 5vw, 32px)
- 正文 PC：15px 到 17px
- 正文移动端：clamp(14px, 3.5vw, 16px)
- 辅助文字 PC：13px 到 14px
- 辅助文字移动端：clamp(12px, 3vw, 14px)
- 按钮文字 PC：15px 到 16px
- 按钮文字移动端：clamp(14px, 3.5vw, 15px)
- 卡片标题 PC：17px 到 20px
- 卡片标题移动端：clamp(15px, 4vw, 18px)

移动端禁止直接缩小 PC 版，必须使用 clamp() 或单独移动端布局。

### 6.3 Logo

规则：

- 所有页面必须使用 `<MinsiLogo>`
- Logo 资源路径：`/assets/brand/minsi-logo.svg`
- 禁止重新设计 Logo
- 禁止变形 Logo
- 禁止在页面内用文字拼 Logo
- 禁止临时用 emoji、图标、普通文本替代 Logo

尺寸：

- 手机端：80px 到 96px
- 平板：96px 到 110px
- PC：100px 到 120px

Logo 与 Header 右侧按钮必须垂直居中。

### 6.4 Header

规则：

- 所有页面必须使用 `<SiteHeader>`
- 禁止每页单独写 Header
- PC 端高度：56px 到 64px
- 手机端高度：52px 到 56px
- 登录页可以隐藏导航和登录按钮，但仍复用 SiteHeader

PC 导航建议：

- 首页
- 关于 Minsi
- 隐私与安全
- 用户研究
- 登录/注册

聊天页导航建议：

- 隐私说明
- 语音聊天
- 紧急帮助
- 菜单

紧急帮助入口不得隐藏在深层菜单。

### 6.5 玻璃卡片

GlassCard 的三种强度：

```css
/* soft */
background: var(--minsi-card-bg);
backdrop-filter: blur(12px);
border: 1px solid var(--minsi-border-soft);
border-radius: var(--radius-xl);
box-shadow: var(--shadow-card);

/* medium */
background: var(--minsi-card-bg);
backdrop-filter: blur(16px);
border: 1px solid var(--minsi-border);
border-radius: var(--radius-xl);
box-shadow: var(--shadow-card);

/* strong */
background: var(--minsi-card-bg-strong);
backdrop-filter: blur(20px);
border: 1px solid var(--minsi-border);
border-radius: var(--radius-xl);
box-shadow: var(--shadow-floating);
```

注意：

- 卡片文字必须清晰可读
- 禁止为了透明感牺牲可读性
- 禁止页面内重复手写玻璃卡片样式

### 6.6 图标系统

规则：

- 功能图标使用 lucide-react
- 品牌 Logo 和特殊图形使用 SVG 资源
- 禁止混用多个图标库
- 图标颜色优先使用 `--minsi-purple`、`--minsi-muted`、`--minsi-ink`
- 语义图标加 `aria-label`
- 纯装饰图标加 `aria-hidden="true"`

尺寸：

- 手机普通图标：20px 到 24px
- 卡片图标：24px 到 28px
- PC 普通图标：22px 到 26px

### 6.7 动效

关键词：

- 慢
- 轻
- 柔
- 安静
- 有呼吸感

允许：

- 页面淡入
- 按钮轻微呼吸
- 柔和水纹
- 云朵轻浮
- 背景柔光漂移
- 语音波形轻柔起伏

禁止：

- 强弹跳
- 快速闪烁
- 粒子爆炸
- 快速缩放
- 科技雷达扫描
- 强烈霓虹光效

技术选型：

- 优先：Tailwind CSS + CSS keyframes
- 复杂交互：framer-motion
- 禁止未经审批引入 react-spring、GSAP

---

## PART 7 · 组件状态规范

### 7.1 MinsiButton 状态

- default：薰衣草紫渐变，使用 `--shadow-button`
- hover：柔和光晕扩散，亮度微升
- active：轻微下沉，`scale(0.98)`
- focus-visible：使用 `--shadow-focus`
- disabled：`opacity: 0.45`，`cursor: not-allowed`
- loading：浅紫 shimmer，不使用强旋转图标

### 7.2 输入框状态

- default：border 使用 `--minsi-border-soft`
- hover：border 使用 `--minsi-border`
- focus：border 使用 `--minsi-purple`，加 `--shadow-focus`
- filled：border 使用 `--minsi-border`
- error：border 使用 `--minsi-danger`，文案温和
- disabled：`opacity: 0.45`

错误文案示例：

- 正确：验证码好像不太对，可以再检查一下。
- 错误：验证码错误！

### 7.3 二维码卡片状态

- loading：浅紫 shimmer 占位
- active：显示二维码，二维码区域必须纯白背景，显示倒计时
- expired：模糊遮罩 + 刷新按钮
- scanned：显示“已扫码，请在手机上确认”
- confirmed：成功动效，跳转
- error：温和错误文案 + 重试入口

二维码背景要求：

- 二维码区域必须纯白
- 微信和 QQ 二维码都必须统一纯白背景
- 禁止透明背景
- 禁止高饱和绿色或蓝色大面积按钮

---

## PART 8 · 工程规范

### 8.1 状态管理

- UI 状态：React local state，useState
- 跨页面轻量状态：Zustand
- 服务器状态：SWR
- 禁止引入 Redux，除非项目复杂度显著上升并获得确认

### 8.2 SWR Fetcher

统一 fetcher：

```ts
export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("网络好像出了点问题，稍后再试一下。")
  }
  return res.json()
}
```

使用示例：

```ts
const { data, error, isLoading } = useSWR("/api/auth/session", fetcher)
```

### 8.3 Auth 状态规范

- token 存储：HttpOnly Secure Cookie，由后端设置
- 前端只保存非敏感 UI 偏好，例如语言
- 认证状态通过 `/api/auth/session` 检查
- token 过期后跳转 `/login`，并显示温和提示
- 禁止把 token、uid、session 存入 localStorage
- 禁止前端明文存储任何敏感信息

### 8.4 聊天实时通信

- 文字聊天：优先 SSE 实现流式输出
- 语音聊天：WebSocket 双向通信

连接状态 UI：

- connecting：浅紫 shimmer 占位，文案“正在连接…”
- connected：正常输入态
- error：“连接好像断了，稍后再试一下。” + 重连按钮
- reconnecting：“稍等，马上回来。”

断线重连：

- 最多重试 3 次
- 指数退避：1s -> 2s -> 4s
- 超限后显示温和错误

### 8.5 聊天内容隐私规范

严格禁止：

- 禁止将聊天内容写入 localStorage
- 禁止将聊天内容写入 IndexedDB
- 禁止将聊天内容写入 Cookie
- 禁止将聊天内容写入任何长期本地存储
- 禁止显示“历史记录”“保存对话”“恢复上次聊天”等入口

允许：

- 当前页面内 useState 保存临时消息
- 刷新页面后消息清空
- 关闭连接后清空消息队列
- 退出聊天后清空前端内存状态

输入草稿：

- 如需短暂保留输入草稿，仅限组件内 useState
- 禁止持久化草稿

### 8.6 二维码登录状态机

```txt
loading -> active -> scanned -> confirmed -> 跳转聊天页
             |
             -> expired -> 用户点刷新 -> loading
loading -> error
```

### 8.7 国际化

目录：

```txt
messages/
  zh.json
  en.json
```

规则：

- 中文为默认语言
- 浏览器语言为英文时默认英文
- 用户手动切换后记入 `localStorage["minsi-lang"]`
- localStorage 只允许保存语言这类非敏感偏好
- 所有文案从字典读取
- 禁止页面硬编码中英混杂
- Logo 和品牌名 Minsi.ai 不翻译

---

## PART 9 · 页面规范

### 9.1 页面类型

- 品牌展示页：首页、关于 Minsi
- 功能入口页：登录/注册
- 核心产品页：文字聊天、语音聊天
- 信任说明页：隐私与安全
- 内容收集页：用户研究

### 9.2 路由与文件命名

```txt
app/
  page.tsx
  layout.tsx
  not-found.tsx
  error.tsx
  login/
    page.tsx
  about/
    page.tsx
  privacy/
    page.tsx
  research/
    page.tsx
  chat/
    text/
      page.tsx
    voice/
      page.tsx
```

### 9.3 响应式验收尺寸

必须检查以下尺寸：

PC：

- 1920x1080
- 1440x900
- 1366x768
- 1280x800

平板：

- 1024x768
- 820x1180
- 768x1024

手机：

- 430x932
- 393x852
- 390x844
- 375x812
- 360x780

验收要求：

- 禁止横向滚动
- 核心内容不裁切
- 移动端不直接缩小 PC 版
- 装饰元素可隐藏或缩小
- 按钮点击区域 >= 44px
- 底部内容不被浏览器安全区域遮挡
- 聊天输入框必须适配 safe-area-inset-bottom

### 9.4 Metadata 模板

每个页面必须配置 metadata。

```ts
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Minsi.ai | 敏锐地感受，耐心地陪伴",
  description: "不评判，不打断。Minsi 在这里，听你说。",
  openGraph: {
    title: "Minsi.ai | 敏锐地感受，耐心地陪伴",
    description: "不评判，不打断。Minsi 在这里，听你说。",
    images: ["/assets/brand/og-home.png"],
  },
}
```

页面 title 建议：

- 首页：Minsi.ai | 敏锐地感受，耐心地陪伴
- 登录页：登录 Minsi.ai | 安全进入你的表达空间
- 隐私页：隐私与安全 | Minsi.ai
- 关于页：关于 Minsi | Minsi.ai
- 用户研究页：用户研究 | Minsi.ai
- 文字聊天页：和 Minsi 聊聊 | Minsi.ai
- 语音聊天页：语音陪伴 | Minsi.ai

上线前必须提供：

- `app/robots.ts`
- `app/sitemap.ts`
- `app/manifest.ts`
- `app/icon.png`
- `app/apple-icon.png`
- `opengraph-image.png` 或 `metadata.openGraph.images`

Metadata 要求：

- 每个页面必须配置 title、description。
- 重要页面必须配置 openGraph。
- Logo 和品牌名 Minsi.ai 不翻译。
- 页面 metadata 不得出现“AI 心理医生”“治疗”“治愈焦虑”等医疗化承诺。

---

## PART 10 · 登录页规范

### 10.1 页面目标

登录页的目标：

- 低压力进入
- 安全感
- 隐私承诺清晰
- 不要求手机号
- 不要求真实姓名

### 10.2 登录方式

支持：

- 微信扫码登录
- QQ 扫码登录
- 邮箱验证码登录

不建议：

- 手机号登录
- 强制实名
- 复杂注册流程

### 10.3 登录页结构示例

```tsx
"use client"

import { useState } from "react"
import type { QRStatus } from "@/components/login"

interface LoginPageClientProps {
  wechatQrUrl: string;
  refreshWechatQr: () => void;
}

export function LoginPageClient({
  wechatQrUrl,
  refreshWechatQr,
}: LoginPageClientProps) {
  const [wechatStatus, setWechatStatus] = useState<QRStatus>("loading");
  const [wechatExpiresIn, setWechatExpiresIn] = useState(0);

  return (
    <>
      <SiteHeader showNav={false} showLogin={false} />
      <main className="minsi-shell minsi-centered">
        <MinsiLogo size="lg" />
        <AuthCard
          title="安全进入"
          subtitle="不用真实姓名，也不用手机号。"
        >
          <QRLoginCard
            provider="wechat"
            qrSrc={wechatQrUrl}
            status={wechatStatus}
            expiresIn={wechatExpiresIn}
            onRefresh={refreshWechatQr}
          />
          <EmailLoginForm />
          <MinsiButton variant="primary" fullWidth>
            安全进入
          </MinsiButton>
        </AuthCard>
        <SafetyNotice variant="footer" />
      </main>
    </>
  );
}
```

说明：

- status 和 expiresIn 必须来自接口或前端状态机。
- 禁止在真实登录逻辑中硬编码 `status="active"`。
- QRLoginCard 必须遵守 loading -> active -> scanned -> confirmed / expired / error 的状态机。

### 10.4 邮箱验证码登录流程

- 邮箱输入
- 获取验证码 loading
- 验证码输入
- 提交 loading
- 成功跳转
- 失败显示温和错误

错误文案：

- 验证码好像不太对，可以再检查一下。
- 这个邮箱格式好像不太对。
- 发送太频繁了，可以稍后再试一下。
- 网络好像有点慢，我们再试一次。

### 10.5 二维码视觉要求

- 二维码卡片背景必须纯白
- 微信和 QQ 的二维码视觉高度统一
- 微信绿色和 QQ 蓝色只能作为小图标点缀
- 禁止大面积绿色或蓝色按钮
- 二维码过期要显示刷新入口
- 二维码倒计时文案要清晰

微信和 QQ 不建议同时启动轮询。

推荐实现：

- Tab 切换
- Segmented Control 切换
- 用户选择登录方式后再加载对应二维码

规则：

- 同一时间只允许一个 QRLoginCard 处于 active 轮询状态。
- 未选中的二维码不得发起轮询。
- 切换登录方式时，必须停止上一个二维码的轮询。
- 微信绿色和 QQ 蓝色只能作为小图标点缀，不能作为大面积按钮主色。

### 10.6 邮箱验证码安全与防重复提交

邮箱验证码流程必须遵守：

- 获取验证码按钮必须有倒计时。
- 倒计时期间禁止重复发送。
- 验证码输入限制长度。
- 邮箱格式在前端做基础校验。
- 提交时 loading，避免重复提交。
- 错误提示不得暴露后端内部原因。
- 频率限制必须由后端控制，前端只做 UI 提示。
- 不允许把邮箱验证码、token、session 写入 localStorage。
- 成功登录后由后端设置 HttpOnly Secure Cookie。

温和错误文案示例：

- 这个邮箱格式好像不太对。
- 验证码好像不太对，可以再检查一下。
- 发送太频繁了，可以稍后再试一下。
- 网络好像有点慢，我们再试一次。

---

## PART 11 · 聊天页规范

### 11.1 共同原则

文字聊天页和语音聊天页必须遵守：

- 不保存聊天内容
- 退出后自动清除
- 不显示历史记录
- 不显示保存对话
- 紧急帮助入口必须常驻
- 隐私说明必须清晰
- 底部输入区域必须适配 safe area

### 11.2 文字聊天页

推荐结构：

- 顶部：SiteHeader
- 中间：聊天消息区域
- 右侧或底部：Minsi 陪伴提示、快捷入口、紧急帮助
- 底部：输入框、发送按钮、语音切换按钮

快捷入口建议：

- 我说不清楚
- 情绪选择
- 切换语音
- 我想先安静一下

### 11.3 语音聊天页

必须注意：

- 不要显示“实时转写”
- 避免造成“被记录”的印象
- 主状态用柔和声波或状态点表达
- 右侧可以保留隐私保护面板
- 不要重复展示隐私浮窗

状态文案：

- 正在聆听中…
- 我在认真听你说
- 可以慢慢说，不用一次讲清楚

状态点：

- 正在聆听时可以使用柔和珊瑚红状态点
- 禁止使用刺眼鲜红

### 11.4 清除聊天确认 Modal

清除聊天必须弹出确认 Modal。

文案：

- 标题：清除当前聊天？
- 正文：这只会清除你当前页面里的内容，Minsi 不会保存你的聊天记录。
- 按钮：取消 | 清除

### 11.5 危机响应 UI 边界

当用户表达自伤、他伤、危险处境时：

- 不进入普通安慰话术。
- 显示紧急帮助卡片。
- 建议联系可信赖大人、监护人、学校老师或当地紧急服务。
- 不承诺 Minsi 可以解决危机。
- 不生成诊断、治疗承诺或医疗建议。
- 不把 Minsi 称为 AI 心理医生。
- 紧急帮助入口必须常驻，不得隐藏在深层菜单。

紧急帮助卡片文案应温和、明确，不制造恐慌。

---

## PART 12 · 隐私与安全规范

### 12.1 必须说明

所有关键页面必须以合适方式说明：

- 聊天不保存，退出后自动清除
- Minsi 不是医生或心理治疗师
- 如有危险想法，请联系可信赖的大人或专业机构

### 12.2 Cookie Banner

规则：

- 使用玻璃卡片风格
- 文案温和
- 不使用诱导式暗黑模式
- 用户拒绝时不加载非必要追踪脚本

按钮：

- 只允许必要 Cookie
- 同意全部
- 管理偏好

### 12.3 安全响应头

上线前由工程负责人配置：

- Content-Security-Policy
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(self)

### 12.4 错误页安全

错误页禁止暴露：

- 技术堆栈
- 数据库错误
- API 细节
- Token 信息
- 用户隐私信息

允许：

- `console.error(error)` 用于监控
- 用户侧只显示温和文案

---

## PART 13 · 图片资源规范

目录：

```txt
public/assets/
  brand/
  home/
  login/
  chat/
  about/
  privacy/
  research/
```

规则：

- Logo 和图标使用 SVG
- 复杂装饰图使用 WebP
- 使用 next/image
- 使用 next/image 时必须提供 width / height，或使用 fill + sizes
- 只有真正可能成为 LCP 的首屏图片才允许 priority
- 禁止所有图片都加 priority
- 大装饰图优先使用 WebP 或 AVIF
- 背景大图必须考虑移动端替代尺寸
- 纯装饰图 alt=""
- 语义图片必须有 alt
- 禁止使用外链图片作为核心资源

Logo 资源：

```txt
public/assets/brand/minsi-logo.svg
```

OG 图资源：

```txt
public/assets/brand/og-home.png
```

OG 图规范：

- OG 图尺寸统一为 1200×630px。
- 格式使用 PNG 或 JPG。
- 首页默认使用 `/assets/brand/og-home.png`。
- 每个重要页面可以配置独立 OG 图。

---

## PART 14 · 依赖与 Bundle 控制

允许：

- Tailwind CSS
- lucide-react
- framer-motion
- SWR
- Zustand
- next/font
- next/image

禁止：

- Bootstrap
- Ant Design
- Material UI
- react-spring
- GSAP
- 大型 UI 套件
- 多个图标库混用

性能目标：

- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

---

## PART 15 · ErrorBoundary 与错误页

### 15.1 ErrorBoundary

文件：`components/shared/ErrorBoundary.tsx`  
必须是 Client Component  
顶部必须加 `"use client"`

用户侧文案：

```txt
页面好像暂时没有准备好，我们可以重新试一次。
```

按钮：

- 重新加载
- 返回首页

### 15.2 not-found.tsx

404 页要求：

- 使用玻璃卡片
- 温和文案
- 返回首页按钮
- 不暴露技术信息

文案示例：

```txt
这个页面好像走远了。
我们可以先回到 Minsi 首页。
```

### 15.3 error.tsx

要求：

- 必须加 `"use client"`
- 不暴露技术堆栈
- 可以 `console.error(error)`
- 提供重新加载和返回首页

---

## PART 16 · 可访问性规范

必须做到：

- 所有图片有 alt
- 纯装饰图片 alt=""
- 所有图标有 aria-hidden 或 aria-label
- focus-visible 轮廓清晰可见
- 键盘可操作所有交互
- 文本对比度符合 WCAG AA
- 移动端点击区域 >= 44px
- prefers-reduced-motion 在 globals.css 统一处理
- 表单错误提示要和输入框有关联
- 按钮 loading 时避免重复提交

---

## PART 17 · 文案规范

### 17.1 文案气质

必须：

- 温柔
- 简洁
- 不评判
- 不制造压力
- 不营销化
- 不夸大能力

禁止：

- 立即体验
- 马上治愈
- 解决你的心理问题
- 保存历史记录
- AI 心理医生
- 治愈你的焦虑
- 永久保存你的情绪档案

推荐按钮文案：

- 开始和 Minsi 聊聊
- 安全进入
- 继续
- 发送
- 我想慢慢说
- 查看帮助资源
- 返回首页

### 17.2 品牌表达

推荐表达：

- 敏锐地感受，耐心地陪伴
- 不评判，不打断
- 你可以慢慢说
- 我在这里，听你说
- 安全、温柔、不评判的表达空间

### 17.3 安全边界表达

必须避免医疗化承诺。

正确：

- Minsi 不是医生或心理治疗师。
- 如果你正在经历危险，或有伤害自己/他人的想法，请尽快联系可信赖的大人或专业机构。

错误：

- Minsi 可以治疗你的心理问题。
- Minsi 会帮你摆脱抑郁。
- Minsi 是你的 AI 心理医生。

---

## PART 18 · 用户研究页规范

### 18.1 页面目标

用户研究页用于：

- 匿名收集用户反馈
- 展示经过人工审核后的匿名反馈
- 支持招生、项目展示、产品迭代
- 建立真实可信的用户研究证据

### 18.2 表单原则

- 不要求真实姓名
- 不要求手机号
- 可以选填邮箱
- 地区可由系统根据 IP 判断，前台不要求用户填写
- 反馈提交前说明会匿名处理
- 展示内容必须经过人工审核

### 18.3 满意度选项

推荐：

- 很有帮助
- 有一点帮助
- 还不确定

不推荐：

- 暂时没有
- 没用
- 无帮助

### 18.4 展示规则

- 所有展示反馈必须匿名
- 不得展示个人敏感信息
- 城市标签云下方的匿名审核说明必须清晰可读
- 说明文字颜色不能太浅
- 长文本卡片要支持展开或自然换行
- 禁止卡片高度强行固定导致内容被裁切

---

## PART 19 · 开发执行流程

Codex 每次接到开发任务时，必须按以下顺序执行：

1. 阅读 `docs/minsi-frontend-skill.md`
2. 阅读 `app/page.tsx`
3. 阅读 `app/globals.css`
4. 阅读 `components/site/*`
5. 确认已有公共组件，不重复创建
6. 如缺少公共组件，先补公共组件
7. 再开发页面或功能
8. 检查是否新增了裸 hex 色值
9. 检查是否误写 dark: class
10. 检查是否破坏首页视觉
11. 运行 lint、typecheck、build

---

## PART 20 · 质量检查清单

每次修改后必须检查：

```txt
□ 首页 PC 端视觉不变
□ 首页手机端视觉不变
□ 登录页 PC 端正常
□ 登录页手机端正常
□ 没有横向滚动
□ 没有新增裸 hex 色值
□ 没有 dark: Tailwind class
□ 没有 props: any
□ 没有重复写 Logo
□ 没有重复写 Header
□ 没有聊天内容持久化
□ 二维码区域是纯白背景
□ 错误页不暴露技术堆栈
□ 移动端点击区域 >= 44px
□ safe-area-inset-bottom 已处理
□ npm run lint 通过
□ npm run typecheck 通过
□ npm run build 通过
```

每次修改首页或公共组件后，必须至少检查以下截图：

- 1920x1080 首页
- 1440x900 首页
- 390x844 首页
- 430x932 首页

验收重点：

- Logo 尺寸和位置
- Header 高度
- Hero 主标题比例
- 聊天气泡位置
- 右侧窗景留白
- 卡片透明度
- 按钮颜色和圆角
- 移动端是否单列
- 是否出现横向滚动
- 是否破坏首页原有温柔、奶白、薰衣草紫、玻璃拟态风格

如果视觉回归截图明显偏离首页设计基准，不允许继续开发新页面，必须先修复首页或公共组件。

---

## PART 21 · 需要更新本 Skill 的场景

出现以下情况，必须同步更新本文档：

- 首页设计系统变化
- Logo 变化
- 新增按钮类型或变体
- 新增页面类型
- Auth 流程变化
- 隐私承诺变化
- 响应式规则变化
- 新增或移除依赖库
- 实时通信方案变化
- 聊天数据处理方式变化
- 品牌文案变化

---

## PART 22 · ADR 建议

建议保留架构决策记录：

```txt
docs/adr/
  0001-use-nextjs-app-router.md
  0002-homepage-as-design-source.md
  0003-no-chat-persistence.md
  0004-light-mode-only-v1.md
  0005-swr-for-server-state.md
```

每个 ADR 应说明：

- 背景
- 决策
- 原因
- 替代方案
- 影响范围

---

## PART 23 · 给 Codex 的执行要求

当你作为 Codex 执行 Minsi.ai 前端开发任务时，请严格遵守：

你不是重新设计一个新网站。  
你是在 Minsi.ai 现有首页设计系统之上继续开发。

必须优先复用：

- MinsiLogo
- SiteHeader
- MinsiButton
- GlassCard
- SafetyNotice

禁止：

- 重写 Logo
- 重写 Header
- 新增随意色值
- 写 dark: class
- 保存聊天内容
- 引入大型 UI 框架
- 把页面做成普通 SaaS 风格

如果需求与本文档冲突，以本文档为准。  
如果确实需要突破本文档，必须先说明原因，再进行最小范围修改。

---

## PART 24 · Changelog

| 版本 | 日期 | 主要变更 | 影响范围 |
|------|------|----------|----------|
| v1.1 | 2026-05-19 | 修复中文字体配置、MinsiButton 类型、Dark Mode 策略、二维码状态说明、图片与登录安全规则 | 全项目 |
| v1.0 | 2026-05-19 | 初版，基于首页代码提取 Minsi.ai 前端规范 | 全项目 |

---

Minsi Frontend Skill v1.1 · 规范化即是对用户的尊重。
