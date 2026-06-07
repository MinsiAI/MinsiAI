# Minsi Codex Rules（日常前端短版）

> 日常前端开发默认读本文件。只在设计系统变更、新增公共组件、Auth/隐私边界、Token 或响应式规则调整时，再读 `docs/minsi-frontend-skill.md`。
>
> 本文件只记录所有页面通用的公共组件调用方式与基础约束。页面专属布局、图片、轮播、装饰元素和具体模块参数不要写入本文件。

---

## 0. Quick Rules

1. **公共组件定义品牌标准**：Logo 大小/位置、Header 高度/垂直居中/外层舞台、按钮样式、卡片圆角阴影等全站统一；Figma 里画得偏大或偏小，以组件为准。
2. **Figma 定义页面结构**：布局、比例、间距、视觉层级、装饰元素、响应式形态以 Figma / UI 图为准，目标 100% 还原。
3. **先查组件，再写页面**：`components/site/*`、页面领域组件目录优先；不得复制公共组件代码；页面只调用公共 Header/Logo/Button/Card。
4. **PC/手机导航必须公共化**：PC 端统一走 `SiteHeader` / `SiteHeaderOverlay`、`LanguageSwitch`、Header actions 插槽和公共 header 按钮类；手机端统一走 `SiteHeader variant="mobile"` / `LanguageSwitch compact` / actions 插槽。Header 控件尺寸只改 `app/globals.css` 的公共变量，页面不得单独手写导航或覆盖尺寸。
5. **首次生成代码就做自适应**：同时考虑 PC、平板、手机，禁止先写固定桌面版再补移动端。
6. **Design Tokens 必须使用**：颜色、圆角、阴影、间距来自 `app/globals.css` 或 Token；禁止页面内裸 hex。
7. **禁止重建品牌件**：不得页面内手写 Logo、Header、主按钮、玻璃卡片；不得用页面专属样式覆盖 Header 高度、缩放原点、垂直居中，需先改公共组件/公共样式。
8. **禁用 Dark Mode**：不得写 `dark:` Tailwind class。
9. **图片与字体**：图片用 `next/image`；只有 LCP 首屏关键图加 `priority`；字体用 `next/font`，中文字体不指定 `subsets`。
10. **隐私红线**：token/session/uid 和聊天内容不得写入 localStorage、IndexedDB、Cookie。
11. **安全文案**：Minsi 不是医生或心理治疗师；不得承诺治疗、治愈、保存聊天记录。

---

## 1. 公共组件索引

开发前先读取相关组件文件；Figma 元素必须优先映射到这些组件。

| 组件 | 文件 |
|------|------|
| `MinsiLogo` | `components/site/MinsiLogo.tsx` |
| `SiteHeader` | `components/site/SiteHeader.tsx` |
| `SiteHeaderOverlay` | `components/site/SiteHeaderOverlay.tsx` |
| `LanguageSwitch` | `components/site/LanguageSwitch.tsx` |
| `MinsiButton` | `components/site/MinsiButton.tsx` |
| `GlassCard` | `components/site/GlassCard.tsx` |
| `SafetyNotice` | `components/site/SafetyNotice.tsx` |
| `BrandPageChrome` | `components/site/BrandPageChrome.tsx` |

常见映射：

| Figma 元素 | 优先实现 |
|------------|----------|
| Logo | `MinsiLogo` |
| 顶部栏 | `SiteHeader` |
| 主按钮 | `MinsiButton` |
| 玻璃卡片 | `GlassCard` |
| 隐私安全提示 | `SafetyNotice` |

如果 Figma 出现可复用新模式，优先扩展公共组件；只有一次性页面装饰或布局片段才放页面专用组件。

### 公共组件参数速查

下次做页面前优先按本节调用，不要页面内重写 Logo / Header / Button / Card / 安全提示。

#### `SiteHeader`

```tsx
<SiteHeader
  variant="desktop"
  showNav
  showLogin
  logoHref="/"
  activeNav="about"
/>

<SiteHeader variant="mobile" logoHref="/" />
```

- Props：`variant?: "desktop" | "mobile"`、`showNav?: boolean`、`showLogin?: boolean`、`transparent?: boolean`、`lang?: "zh" | "en"`、`logoHref?: string`、`logoSize?: "sm" | "md" | "lg"`、`activeNav?: "about" | "privacy" | "research"`、`actions?: ReactNode`、`className?: string`。
- 默认：`variant="desktop"`、`showNav=true`、`showLogin=true`、`lang="zh"`、`logoHref="/"`。
- Logo 默认尺寸由 Header 决定：desktop 用 `lg`，mobile 用 `sm`；页面不要为了贴 Figma 单独改 Logo 尺寸。
- mobile 下 `showNav` 控制汉堡菜单；菜单由公共 Header 统一提供页面跳转，固定为「首页」+ PC 公共导航项，页面内不要重写。
- mobile 菜单支持再次点击按钮、点击页面其它区域、用户滚动/滑动页面、按 `Escape` 关闭；不要监听全局 `scroll`，避免被页面内部自动轮播误关。
- mobile 菜单和语言弹窗必须互斥：打开菜单时关闭语言弹窗，打开语言弹窗时关闭菜单，避免遮罩和浮层叠加。
- 登录按钮不在 mobile Header 默认显示；需要额外动作时使用 `actions` 插槽。
- desktop 下 `actions` 会替换默认语言切换和登录按钮；mobile 下 `actions` 追加在语言切换和菜单按钮之后。
- `transparent` 当前保留作兼容参数，品牌页透明效果由公共 CSS 控制，页面不需要单独传。
- 页面只通过 `activeNav` 标记当前页；不要自己写 nav link 或 active underline。

#### `SiteHeaderOverlay`

```tsx
<SiteHeaderOverlay logoHref="/" activeNav="about" />
```

- Props：继承 `SiteHeader` 除 `variant` / `className` 外的参数，另有 `className?: string`、`stageClassName?: string`、`layerClassName?: string`。
- 用于非首页的 PC 顶部品牌导航覆盖层；内部固定调用 `SiteHeader variant="desktop"`。
- mobile Header 仍在页面内调用 `<SiteHeader variant="mobile" />`。

#### `MinsiLogo`

```tsx
<MinsiLogo href="/" size="lg" />
```

- Props：`href?: string`、`size?: "sm" | "md" | "lg"`、`priority?: boolean`、`className?: string`。
- 默认：`href="/"`、`size="md"`、`priority=false`。
- `sm` / `md` 当前为固定移动尺寸；`lg` 用 `cqw` 跟随 desktop stage 缩放。
- 常规页面不要直接调用 Logo；优先通过 `SiteHeader` 使用。

#### `LanguageSwitch`

```tsx
<LanguageSwitch lang="zh" />
<LanguageSwitch compact lang="zh" />
```

- Props：`lang?: "zh" | "en"`、`onChange?: (lang) => void`、`compact?: boolean`、`className?: string`。
- desktop 默认类是 `desktop-language`；mobile compact 默认类是 `mobile-language`。
- 语言选项固定显示 `中文` 和 `English`；英文使用 Title Case，不写成全大写 `ENGLISH`。
- 点击按钮展开语言菜单；点击外部、用户滚动/滑动页面或按 `Escape` 关闭；不要监听全局 `scroll`，避免被页面内部自动轮播误关。
- 语言弹窗和 mobile 菜单必须互斥，避免两个浮层同时打开。
- desktop 语言菜单不使用全屏遮罩，避免首页/登录页 Header 和首屏内容整屏模糊；mobile compact 才使用轻遮罩。
- mobile 语言弹窗遮罩必须低于 Header 层级，不能模糊 Logo 和 Header 控件；弹窗本体仍在 Header 上方。
- 传 `className` 会替换默认按钮类；除非做公共组件扩展，不要在页面里替换。
- 常规页面不要直接调用；优先让 `SiteHeader` 管。

#### `MinsiButton`

```tsx
<MinsiButton href="/target" variant="primary" size="lg" className="minsi-button">
  主操作
</MinsiButton>
```

- Props：`href?: string`、`variant?: "primary" | "soft" | "ghost" | "danger"`、`size?: "sm" | "md" | "lg"`、`loading?: boolean`、`fullWidth?: boolean`、`className?: string`、`children`，并透传原生 `button` / `a` 属性。
- 默认：`variant="primary"`、`size="md"`。
- 有 `href` 时渲染 `<a>`；无 `href` 时渲染 `<button>`。
- `className` 为空，或包含 `minsi-button`，才会自动应用标准 `variant` / `size` 类；纯自定义 className 表示完全自定义按钮外观。
- 主 CTA 优先 `variant="primary" size="lg" className="minsi-button"`；危险/紧急入口用 `variant="danger"`。

#### `GlassCard`

```tsx
<GlassCard as="section" className="page-card" aria-label="模块标题">
  ...
</GlassCard>
```

- Props：`as?: "div" | "section" | "article" | "aside"`、`className?: string`、`children`，并透传 HTML attributes。
- 只负责语义容器；玻璃质感、圆角、阴影必须来自公共 class / design token，不要裸写 hex。

#### `SafetyNotice`

```tsx
<SafetyNotice variant="desktop" />
<SafetyNotice variant="mobile" text="Minsi 不保存你的聊天内容，也不是医生或心理治疗师。" />
```

- Props：`variant?: "desktop" | "mobile"`、`className?: string`、`text?: string`。
- 默认文案必须保留安全边界：Minsi 不保存聊天内容，且不是医生或心理治疗师。
- 传 `className` 会替换默认布局类；替换时必须自己保留定位、字号、颜色、对齐和响应式。

#### `BrandPageChrome`

```tsx
<BrandPageChrome
  showNav
  showLogin
  backgroundSrc="/figma-assets/bg-pc.png"
  mobileBackgroundSrc="/figma-assets/bg-mobile.png"
  safetyText="Minsi 不保存你的聊天内容，也不是医生或心理治疗师。"
  desktopContentClassName="page-desktop-content"
  mobileContentClassName="page-mobile-content"
>
  ...
</BrandPageChrome>
```

- Props：`children`、`showNav?: boolean`、`showLogin?: boolean`、`backgroundSrc?: string`、`mobileBackgroundSrc?: string`、`safetyText?: string`、`safetyNoticeClassName?: string`、`mobileSafetyNoticeClassName?: string`、`desktopContentClassName?: string`、`mobileContentClassName?: string`。
- 默认：`showNav=false`、`showLogin=false`、`backgroundSrc="/figma-assets/bg-pc.png"`。
- 用于全屏品牌页面；内部已经调用 PC / mobile 公共 Header，不要再手写导航。

### 统一布局与标题 Token

- PC Header：`.desktop-header` 代码高度 `64px`；因 `desktop-content-layer` 缩放，视觉高度约 `62px`。页面不得覆盖 Header 高度。
- Mobile Header：`.mobile-header` 视觉高度约 `52px`。
- 普通页面首屏内容起点：PC 用 `--desktop-page-content-top`；mobile 用 `--mobile-page-header-gap`。
- 品牌展示页首屏大标题必须统一使用：
  - PC：`--minsi-desktop-hero-title-size`、`--minsi-desktop-hero-title-line`、`--minsi-desktop-hero-title-gap`、`--minsi-desktop-hero-title-mark-size`
  - Mobile：`--minsi-mobile-hero-title-size`、`--minsi-mobile-hero-title-line`、`--minsi-mobile-hero-title-gap`、`--minsi-mobile-hero-title-mark-size`
- 页面新增 H1 / hero title 时，不要写独立 `text-[...]`；优先复用上述 token 或公共 title class。

---

## 2. 开发流程

```txt
1. 读本文件 Quick Rules
2. 读 app/globals.css
3. 读相关公共组件：components/site/* + 页面领域目录
4. 读 Figma / UI 图
5. 列出 Figma 元素到公共组件的映射
6. 规划 PC / 平板 / 手机自适应
7. 编码实现
8. 按 Figma 结构、公共组件品牌标准、响应式尺寸验收
```

需要更完整规则时，只读 `docs/minsi-frontend-skill.md` 的相关章节，不整篇 dump。

---

## 3. Figma 还原边界

必须还原：

- 页面结构、比例、间距、视觉层级
- PC / 平板 / 手机响应式形态
- 装饰元素、图片关系、卡片密度
- 交互状态和文案层级

不得把 Figma 当成重新创建视觉系统的理由；基础品牌件始终由公共组件和 Design Tokens 定义。

---

## 4. 响应式规则

首版代码就必须适配多尺寸屏幕。

检查尺寸：

- PC：1920x1080、1440x900、1366x768、1280x800
- 平板：1024x768、820x1180、768x1024
- 手机：430x932、390x844、375x812、360x780

实现要求：

- 用弹性布局、百分比、`max-width`、`minmax()`、`clamp()`、媒体查询。
- 禁止写死 1920×1080、固定大宽度容器、只适合单一屏幕的绝对定位。
- 禁止横向滚动。
- 点击区域不少于 44px。
- 底部操作区适配 `safe-area-inset-bottom`。

---

## 5. 资源与 Metadata

- 图片用 `next/image`；装饰图 `alt=""`；语义图写清晰 alt；大装饰图优先 WebP/AVIF。
- 每页配置 `title`、`description`；重要页面配置 `openGraph`。
- Metadata 不得出现“AI 心理医生”“治疗”“治愈焦虑”等医疗化承诺。
- Logo 和品牌名 Minsi.ai 不翻译。

---

## 6. 禁止项

```txt
✗ 裸 hex 色值
✗ dark: Tailwind class
✗ props: any
✗ Bootstrap / Ant Design / Material UI
✗ 横向滚动
✗ 页面内重写 Logo / Header / 主按钮 / 玻璃卡片
✗ token / session / uid 本地持久化
✗ 聊天内容本地持久化
✗ “历史记录 / 保存对话 / 永久保存对话”等误导文案
✗ 错误页暴露技术堆栈、API 细节、Token 信息
```

---

## 7. 最小验收

```txt
□ 已映射 Figma 元素到公共组件
□ Figma 页面结构 100% 还原
□ 公共组件品牌标准未被页面覆盖
□ PC / 平板 / 手机首版已适配
□ 无裸 hex、dark:、props: any
□ 无横向滚动，点击区域 >= 44px
□ 隐私、安全、Metadata 文案无医疗化承诺
```

---

*Minsi Codex Rules · 低 token 日常版 · 完整规范见 `docs/minsi-frontend-skill.md`*
