import Image from "next/image";
import type { ReactNode } from "react";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";
import styles from "./PrivacySafetyPage.module.css";

type AssetIconName = "chat" | "shield" | "feather" | "lock" | "heart";
type DataIconName = "session" | "lock" | "hidden" | "shield" | "clock" | "trash" | "check" | "heart" | "person" | "phone" | "help" | "home";

interface CommitmentCard {
  icon: AssetIconName;
  title: string;
  text: string;
}

interface InfoItem {
  icon: DataIconName;
  title: string;
  text: string;
}

interface QuestionItem {
  question: string;
  answer: string;
}

const safetyText = "Minsi 不保存你的聊天内容，也不是医生或心理治疗师。如遇危险情况，请及时联系可信任的大人或专业机构。";

const commitmentCards: CommitmentCard[] = [
  {
    icon: "chat",
    title: "默认不保存",
    text: "每一次聊天都是临时会话，不会长期保留。"
  },
  {
    icon: "shield",
    title: "退出即可清除",
    text: "离开聊天后，对话内容会自动清除，无法恢复。"
  },
  {
    icon: "feather",
    title: "不用手动管理",
    text: "没有历史记录，也不需要你再去删除，轻松无负担。"
  }
];

const dataItems: InfoItem[] = [
  {
    icon: "shield",
    title: "不保存你的会话内容",
    text: "所有聊天只在会话期间存在，退出后自动清除。"
  },
  {
    icon: "lock",
    title: "不用于训练模型",
    text: "你的聊天内容不会用于优化或训练任何 AI 模型。"
  },
  {
    icon: "hidden",
    title: "不与他人共享",
    text: "我们不会将你的聊天内容展示或提供给其他用户。"
  },
  {
    icon: "session",
    title: "尽力保护你的隐私",
    text: "我们采用合理的技术与管理措施，保护你的信息安全。"
  }
];

const modeItems: InfoItem[] = [
  {
    icon: "clock",
    title: "临时会话",
    text: "不会保留历史"
  },
  {
    icon: "trash",
    title: "退出即清除",
    text: "离开后自动清除"
  },
  {
    icon: "heart",
    title: "安心表达",
    text: "放心说、慢慢说"
  }
];

const canDoItems: InfoItem[] = [
  {
    icon: "heart",
    title: "陪你表达情绪",
    text: "不评判，不催促"
  },
  {
    icon: "session",
    title: "帮你整理想法",
    text: "把混乱慢慢说清"
  },
  {
    icon: "check",
    title: "提供温柔陪伴",
    text: "适合想被听见的时候"
  },
  {
    icon: "home",
    title: "提醒照顾自己",
    text: "鼓励休息和求助"
  }
];

const dangerItems: InfoItem[] = [
  {
    icon: "person",
    title: "联系可信任的大人",
    text: "不要独自承受危险"
  },
  {
    icon: "phone",
    title: "联系当地紧急服务",
    text: "需要时立刻求助"
  },
  {
    icon: "help",
    title: "寻求专业机构帮助",
    text: "把安全放在第一位"
  },
  {
    icon: "shield",
    title: "离开不安全环境",
    text: "先到有人陪伴的地方"
  }
];

const questions: QuestionItem[] = [
  {
    question: "Minsi 会保存我的聊天记录吗？",
    answer: "不会。聊天内容不保存，退出后自动清除。"
  },
  {
    question: "退出之后还能找回之前的聊天吗？",
    answer: "不能。为了减少记录压力，离开聊天后本次对话无法恢复。"
  },
  {
    question: "我需要手动删除记录吗？",
    answer: "不需要。Minsi 会在你退出聊天后自动清除本次内容。"
  },
  {
    question: "别人能看到我的聊天内容吗？",
    answer: "不会。我们不会把你的聊天内容展示或提供给其他用户。"
  },
  {
    question: "Minsi 是医生或心理治疗师吗？",
    answer: "不是。Minsi 可以陪你表达，但不能替代现实中的专业帮助。"
  },
  {
    question: "我可以不登录使用吗？",
    answer: "可以。你可以在不保存聊天内容的前提下开始临时会话。"
  },
  {
    question: "Minsi 会把聊天内容用于训练 AI 吗？",
    answer: "不会。你的聊天内容不会用于优化或训练任何 AI 模型。"
  },
  {
    question: "聊天内容会被用于广告或商业用途吗？",
    answer: "不会。Minsi 不用聊天内容做广告画像或商业推送。"
  },
  {
    question: "我可以选择保存聊天记录吗？",
    answer: "当前不支持保存聊天记录。这个页面的默认边界就是不留下记录。"
  },
  {
    question: "未成年人使用 Minsi 安全吗？",
    answer: "遇到危险、胁迫或伤害自己/他人的想法时，请马上联系可信任的大人或当地紧急服务。"
  }
];

const assetIconSrc: Record<AssetIconName, string> = {
  chat: "/figma-assets/icon-chat.svg",
  shield: "/figma-assets/icon-shield.svg",
  feather: "/figma-assets/icon-feather.svg",
  lock: "/figma-assets/login-lock.svg",
  heart: "/figma-assets/heart.svg"
};

function AssetIcon({ name, size = 56, className = "" }: { name: AssetIconName; size?: number; className?: string }) {
  return <Image className={className} src={assetIconSrc[name]} alt="" width={size} height={size} draggable={false} />;
}

function DataIcon({ name, className = "" }: { name: DataIconName; className?: string }) {
  const commonProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true
  };

  if (name === "lock") {
    return (
      <svg {...commonProps}>
        <path d="M7 10V8a5 5 0 0 1 10 0v2" />
        <rect x="5.5" y="10" width="13" height="10" rx="2.5" />
        <path d="M12 14v2.6" />
      </svg>
    );
  }

  if (name === "hidden") {
    return (
      <svg {...commonProps}>
        <path d="M3.5 12s3.2-5 8.5-5c2 0 3.7.7 5 1.6" />
        <path d="M20.5 12s-3.2 5-8.5 5c-2 0-3.7-.7-5-1.6" />
        <path d="m4.5 4.5 15 15" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.8v4.6l3 1.8" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg {...commonProps}>
        <path d="M8 8h8" />
        <path d="M10 8V6.4h4V8" />
        <path d="M9 10v7" />
        <path d="M15 10v7" />
        <path d="M7 8l.8 11h8.4L17 8" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...commonProps}>
        <path d="m5 12.6 4 4L19 6.4" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg {...commonProps}>
        <path d="M12 19s-7-4.2-7-9.2A4 4 0 0 1 12 7a4 4 0 0 1 7 2.8C19 14.8 12 19 12 19Z" />
      </svg>
    );
  }

  if (name === "person") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="3" />
        <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...commonProps}>
        <path d="M8.2 5.2 6.5 6.7c-.8.7-.8 2.1-.2 3.6a14.8 14.8 0 0 0 7.4 7.4c1.5.6 2.9.6 3.6-.2l1.5-1.7-3.4-3-1.5 1.5c-1.7-.8-3.4-2.5-4.2-4.2l1.5-1.5-3-3.4Z" />
      </svg>
    );
  }

  if (name === "help") {
    return (
      <svg {...commonProps}>
        <path d="M12 19v-3" />
        <path d="M8.5 9a3.5 3.5 0 1 1 5.7 2.7c-1 .8-2.2 1.5-2.2 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg {...commonProps}>
        <path d="m4 11 8-6 8 6" />
        <path d="M6.5 10.5V19h11v-8.5" />
        <path d="M10 19v-5h4v5" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 3.5 19 6v5.5c0 4.2-2.8 7.8-7 9-4.2-1.2-7-4.8-7-9V6l7-2.5Z" />
      <path d="m8.5 12.2 2.3 2.3 4.8-5" />
    </svg>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className={styles.sectionTitle}>
      <h2>{children}</h2>
      <span className={styles.titleRule} aria-hidden="true" />
    </div>
  );
}

function CommitmentCard({ icon, title, text }: CommitmentCard) {
  return (
    <GlassCard as="article" className={styles.commitmentCard}>
      <div className={styles.commitmentIcon}>
        <AssetIcon name={icon} size={80} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </GlassCard>
  );
}

function InfoList({ items, compact = false }: { items: InfoItem[]; compact?: boolean }) {
  return (
    <ul className={compact ? styles.compactList : styles.infoList}>
      {items.map((item) => (
        <li key={item.title}>
          <span className={styles.infoIcon}>
            <DataIcon name={item.icon} />
          </span>
          <span>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function PrivacyModeCard() {
  return (
    <aside className={styles.modePanel} aria-label="当前隐私模式">
      <h2>当前隐私模式</h2>
      <div className={styles.modeCard}>
        <div>
          <span className={styles.liveDot} aria-hidden="true" />
          <strong>临时聊天中</strong>
          <p>聊天内容不会保存</p>
          <p>退出后自动清除</p>
        </div>
        <Image className={styles.modeShield} src="/assets/about/boundary.png" alt="" width={146} height={167} draggable={false} />
      </div>
      <InfoList items={modeItems} compact />
      <p className={styles.modeHint}>此模式为默认设置，无法关闭，也无需设置。</p>
    </aside>
  );
}

function DataTreatmentSection() {
  return (
    <GlassCard as="section" className={styles.dataCard} aria-labelledby="privacy-data-title">
      <div className={styles.dataCopy}>
        <SectionTitle>
          <span id="privacy-data-title">我们如何对待你的数据</span>
        </SectionTitle>
        <InfoList items={dataItems} />
        <p className={styles.dataFootnote}>
          <DataIcon name="lock" />
          Minsi 的设计目标是：让你可以安心表达，而无需担心记录被保存。
        </p>
      </div>
      <PrivacyModeCard />
    </GlassCard>
  );
}

function BoundarySection() {
  return (
    <GlassCard as="section" className={styles.boundaryCard} id="safety-boundary" aria-labelledby="privacy-boundary-title">
      <div className={styles.boundaryImageWrap}>
        <Image className={styles.boundaryCloud} src="/figma-assets/cloud.png" alt="" width={360} height={268} sizes="(max-width: 767px) 180px, 240px" draggable={false} />
      </div>
      <div className={styles.boundaryCopy}>
        <h2 id="privacy-boundary-title">Minsi 会陪你，但不会替代现实中的帮助</h2>
        <p>Minsi 可以陪你慢慢说、写下想法、梳理表达。它不是医生或心理治疗师，也不能替代可信任的人或专业机构。</p>
      </div>
      <div className={styles.boundaryLists}>
        <div>
          <h3>Minsi 可以做的</h3>
          <InfoList items={canDoItems} compact />
        </div>
        <div>
          <h3>遇到危险时</h3>
          <InfoList items={dangerItems} compact />
        </div>
      </div>
      <SafetyNotice variant="mobile" className={styles.boundaryNotice} text={safetyText} />
    </GlassCard>
  );
}

function FaqSection() {
  return (
    <GlassCard as="section" className={styles.faqCard} id="privacy-questions" aria-labelledby="privacy-faq-title">
      <SectionTitle>
        <span id="privacy-faq-title">你可能关心的问题</span>
      </SectionTitle>
      <div className={styles.faqGrid}>
        {questions.map((item) => (
          <details className={styles.faqItem} key={item.question}>
            <summary>
              <span>
                <DataIcon name="session" />
              </span>
              {item.question}
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </GlassCard>
  );
}

function RulesCallout() {
  return (
    <GlassCard as="section" className={styles.rulesCard} aria-labelledby="privacy-rules-title">
      <Image className={styles.rulesIcon} src="/figma-assets/login-lock.svg" alt="" width={112} height={112} draggable={false} />
      <div className={styles.rulesCopy}>
        <h2 id="privacy-rules-title">想了解完整规则？</h2>
        <p>查看《隐私政策》和《用户协议》</p>
        <small>我们会尽量用清楚、简单的语言解释每一项规则。</small>
      </div>
      <div className={styles.rulesActions}>
        <MinsiButton type="button" variant="ghost" size="sm" className={`minsi-button ${styles.policyButton}`}>
          隐私政策
        </MinsiButton>
        <MinsiButton type="button" variant="ghost" size="sm" className={`minsi-button ${styles.policyButton}`}>
          用户协议
        </MinsiButton>
      </div>
    </GlassCard>
  );
}

export function PrivacySafetyPage() {
  return (
    <main className={styles.page}>
      <SiteHeaderOverlay activeNav="privacy" showNav showLogin logoHref="/" />
      <div className={styles.mobileHeaderShell}>
        <SiteHeader variant="mobile" logoHref="/" />
      </div>

      <div className={styles.canvas}>
        <section className={styles.hero} aria-labelledby="privacy-hero-title">
          <Image className={styles.heroBg} src="/assets/privacy/hero-bg.png" alt="" fill sizes="(max-width: 1023px) 100vw, 1440px" priority draggable={false} />
          <div className={styles.heroVeil} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <h1 id="privacy-hero-title">
              <span>你可以放心说，</span>
              <strong>不用留下记录</strong>
            </h1>
            <Image className={styles.heroHeart} src="/figma-assets/heart.svg" alt="" width={44} height={44} draggable={false} />
            <p>Minsi 的所有会话都不会保存。你退出聊天后，本次对话内容会自动清除。</p>
          </div>
        </section>

        <section className={styles.commitments} aria-label="隐私承诺">
          {commitmentCards.map((card) => (
            <CommitmentCard key={card.title} {...card} />
          ))}
        </section>

        <DataTreatmentSection />
        <BoundarySection />
        <FaqSection />
        <RulesCallout />

        <footer className={styles.footer}>
          <p>© 2026 Minsi.ai. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
