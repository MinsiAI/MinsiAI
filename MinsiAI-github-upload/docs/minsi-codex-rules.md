# Minsi Codex Rules（日常前端短版）

> 日常前端开发默认读本文件。只在设计系统变更、新增公共组件、Auth/隐私边界、Token 或响应式规则调整时，再读 `docs/minsi-frontend-skill.md`。

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
