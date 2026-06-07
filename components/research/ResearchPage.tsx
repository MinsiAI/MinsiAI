import Image from "next/image";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";
import { ResearchFeedbackCarousel } from "./ResearchFeedbackCarousel";
import { ResearchGuideCarousel } from "./ResearchGuideCarousel";
import styles from "./ResearchPage.module.css";

const researchAsset = (name: string) => `/assets/research/${name}`;

type ResearchIconType = "shield" | "comment" | "refresh" | "people" | "location" | "heart" | "sparkle" | "send" | "lock" | "check";

interface Metric {
  value: string;
  label: string;
  icon: ResearchIconType;
}

interface GuideItem {
  title: string;
  body: string;
  icon: ResearchIconType;
}

interface FeedbackItem {
  city: string;
  body: string;
  tag: string;
}

const trustItems: GuideItem[] = [
  {
    title: "隐私保护",
    body: "只收集你主动提交的反馈",
    icon: "shield"
  },
  {
    title: "自愿参与",
    body: "可以跳过问题，随时退出",
    icon: "check"
  },
  {
    title: "匿名样本",
    body: "帮助校准产品表达",
    icon: "comment"
  }
];

const metrics: Metric[] = [
  { value: "48+", label: "内测体验", icon: "people" },
  { value: "31+", label: "反馈样本", icon: "comment" },
  { value: "9+", label: "覆盖城市", icon: "location" },
  { value: "100%", label: "自愿参与", icon: "heart" }
];

const guideItems: GuideItem[] = [
  {
    title: "研究目的",
    body: "了解用户在开口、隐私说明和离开流程上的真实感受，优化 Minsi 的入口、文案和安全提示。",
    icon: "sparkle"
  },
  {
    title: "参与方式",
    body: "你可以选择匿名问卷、原型试用或短访谈。参与完全自愿，可以跳过任何问题，也可以随时退出。",
    icon: "comment"
  },
  {
    title: "反馈如何使用",
    body: "反馈只用于改进产品体验和安全边界。Minsi 不保存聊天内容，退出后自动清除，也不会长期追踪你的表达。",
    icon: "shield"
  }
];

const suitableItems = ["正在试用 Minsi 的用户", "对隐私与表达安全有顾虑的人", "希望反馈界面、入口或文案的人", "青少年照护者、教育工作者或产品体验参与者"];

const feedbackItems: FeedbackItem[] = [
  {
    city: "北京",
    body: "我一开始担心自己说得太乱，后来发现可以慢慢讲，不需要马上整理成完整故事，这让我更愿意继续试用。",
    tag: "被理解"
  },
  {
    city: "上海",
    body: "最有用的是入口文案不催我，也没有让我填很多信息。看到退出后会清除，我才敢把真实想法写出来。",
    tag: "情绪表达"
  },
  {
    city: "成都",
    body: "我希望隐私说明再靠前一点，尤其是在第一次进入聊天前。如果能用更短的句子说明不保存内容，会更安心。",
    tag: "不保存记录"
  },
  {
    city: "广州",
    body: "有些时候我只是想把今天发生的事说出来，不一定需要建议。Minsi 的语气比较安静，没有把我往某个结论上带。",
    tag: "被理解"
  },
  {
    city: "纽约",
    body: "I was testing it late at night and liked that it didn't ask for a profile before I could start. The privacy note made the flow feel safer.",
    tag: "表达入口"
  },
  {
    city: "杭州",
    body: "考试周试用的时候，我不想被提醒要立刻变好，只想先把事情讲清楚。这个节奏比较轻，不会让我有负担。",
    tag: "考试压力"
  },
  {
    city: "武汉",
    body: "我会跳过一些不想回答的问题，这点很重要。研究说明里写着可以随时退出，让我觉得参与不是一种压力。",
    tag: "轻松表达"
  },
  {
    city: "深圳",
    body: "如果后续做正式版本，希望保留匿名反馈入口。不是每个人都愿意留下联系方式，但很多细节其实可以帮助你们改产品。",
    tag: "隐私安全"
  },
  {
    city: "多伦多",
    body: "Sometimes I only wanted to write one messy paragraph and leave. It helped that the product didn't make me label everything before I could continue.",
    tag: "不评判"
  }
];

const filters = ["全部", "不保存记录", "情绪表达", "被理解", "语音聊天", "考试压力", "其他"];
const cities = ["北京", "上海", "广州", "成都", "深圳", "杭州", "武汉", "西安", "南京", "重庆", "纽约", "多伦多", "新加坡", "温哥华", "悉尼", "墨尔本", "伦敦", "巴黎", "东京", "首尔", "曼谷", "更多城市"];
const experienceOptions = ["不保存记录", "隐私安全", "考试压力", "被理解", "情绪表达", "语音聊天", "其他"];

function ResearchIcon({ type, className = "" }: { type: ResearchIconType; className?: string }) {
  if (type === "shield") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.5 19 6v5.6c0 4.2-2.8 7.7-7 8.9-4.2-1.2-7-4.7-7-8.9V6l7-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m8.7 12.1 2.1 2.1 4.7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "comment") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5.4 5.7h13.2v9.1H10l-4.6 3.5V5.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8.3 9.3h7.4M8.3 12h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "refresh") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M18.4 8.2A7.1 7.1 0 0 0 6.2 7.1L5 8.4M5.6 15.8a7.1 7.1 0 0 0 12.2 1.1l1.2-1.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 4.8v3.6h3.6M19 19.2v-3.6h-3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "people") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 12a3.9 3.9 0 1 0 0-7.8A3.9 3.9 0 0 0 12 12ZM4.9 20c1.4-3.8 3.7-5.6 7.1-5.6s5.7 1.8 7.1 5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4.8 11.3a2.8 2.8 0 0 1 0-5.4M19.2 5.9a2.8 2.8 0 0 1 0 5.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "location") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s6.2-5.4 6.2-11.1A6.2 6.2 0 0 0 5.8 9.9C5.8 15.6 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="12" cy="9.8" r="2.1" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (type === "heart") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 20.2s-7.1-4.3-8.6-9.1C2.4 7.7 4.4 5.2 7.2 5.2c1.7 0 3.1.9 4 2.2.9-1.3 2.3-2.2 4-2.2 2.8 0 4.8 2.5 3.8 5.9-1.5 4.8-7 9.1-7 9.1Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === "sparkle") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.5 14 9l5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2 2-5.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "send") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m4.5 12.2 15-7.1-5.4 14.8-2.8-6.2-6.8-1.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m11.2 13.7 8.1-8.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5.8" y="10" width="12.4" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.6 10V8.2a3.4 3.4 0 0 1 6.8 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12.4 4.2 4.1L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHeading({ title, body, id }: { title: string; body?: string; id: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h2 id={id}>{title}</h2>
      {body ? <span>{body}</span> : null}
    </div>
  );
}

function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="research-hero-title">
      <div className={styles.heroCopy}>
        <div className={styles.heroTitleWrap}>
          <h1 id="research-hero-title">听听他们怎么说</h1>
          <ResearchIcon type="sparkle" className={styles.heroSparkle} />
        </div>
        <p className={styles.heroLead}>这里收集了一些来自内测体验和产品测试中的匿名心声。每一条反馈都经过隐私处理，已去除姓名、学校、联系方式等可识别个人身份的信息。我们希望你在这里看到的不只是数据，而是一些具体的感受、困惑，以及被认真倾听的瞬间。</p>
        <div className={styles.heroActions}>
          <MinsiButton href="#share" variant="primary" size="lg" className={`minsi-button ${styles.primaryButton}`}>
            分享你的想法
          </MinsiButton>
          <MinsiButton href="#privacy" variant="soft" size="lg" className={`minsi-button ${styles.secondaryButton}`}>
            了解隐私保护
          </MinsiButton>
        </div>
        <div className={styles.trustList} aria-label="匿名心声承诺">
          {trustItems.map((item) => (
            <div className={styles.trustItem} key={item.title}>
              <ResearchIcon type={item.icon} className={styles.trustIcon} />
              <div>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.heroVisual}>
        <Image src={researchAsset("hero-cloud-logo-balanced.png")} alt="Minsi 云朵形象与用户反馈卡片" width={1748} height={861} priority sizes="(min-width: 1024px) 716px, 100vw" />
      </div>
    </section>
  );
}

function MetricsSection() {
  return (
    <GlassCard as="section" className={styles.metricsPanel} aria-label="匿名心声数据概览">
      {metrics.map((metric, index) => (
        <div className={styles.metricItem} key={metric.label}>
          <span className={`${styles.metricIcon} ${styles[`metricIcon-${metric.icon}`]}`}>
            <ResearchIcon type={metric.icon} />
          </span>
          <div>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
          {index < metrics.length - 1 ? <i aria-hidden="true" /> : null}
        </div>
      ))}
    </GlassCard>
  );
}

function ResearchGuideSection() {
  return (
    <section className={styles.guideSection} aria-labelledby="research-guide-title">
      <SectionHeading id="research-guide-title" title="我们想更认真地听见使用体验" body="研究重点放在表达入口、隐私理解和安全边界，不会读取或保存聊天内容。" />
      <ResearchGuideCarousel items={guideItems} />
      <div className={styles.guideGrid}>
        {guideItems.map((item) => (
          <GlassCard as="article" className={styles.guideCard} key={item.title}>
            <div className={styles.guideCardHeader}>
              <span>
                <ResearchIcon type={item.icon} />
              </span>
              <h3>{item.title}</h3>
            </div>
            <p>{item.body}</p>
          </GlassCard>
        ))}
      </div>
      <GlassCard as="aside" className={styles.suitablePanel} aria-label="适合参与的人">
        <div>
          <ResearchIcon type="people" />
          <h3>适合参与的人</h3>
        </div>
        <ul>
          {suitableItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}

function FeedbackSection() {
  return (
    <GlassCard as="section" className={styles.feedbackPanel} aria-labelledby="research-feedback-title">
      <div className={styles.panelHeader}>
        <div>
          <h2 id="research-feedback-title">匿名反馈</h2>
          <span aria-hidden="true" />
        </div>
        <div className={styles.filterList} aria-label="反馈分类">
          {filters.map((filter, index) => (
            <button className={index === 0 ? styles.activeFilter : undefined} type="button" key={filter}>
              {filter}
            </button>
          ))}
        </div>
        <p className={styles.updating}>
          持续更新
          <ResearchIcon type="refresh" />
        </p>
      </div>
      <ResearchFeedbackCarousel items={feedbackItems} />
      <div className={styles.feedbackGrid}>
        {feedbackItems.map((item) => (
          <article className={styles.feedbackCard} key={`${item.city}-${item.tag}`}>
            <div className={styles.feedbackMeta}>
              <ResearchIcon type="location" />
              <span>{item.city}</span>
            </div>
            <blockquote>{item.body}</blockquote>
            <div className={styles.feedbackFooter}>
              <span>{item.tag}</span>
              <button type="button">展开</button>
            </div>
          </article>
        ))}
      </div>
      <div className={styles.feedbackMore}>
        <MinsiButton href="#share" variant="soft" size="sm" className={`minsi-button ${styles.softButton}`}>
          查看更多反馈
        </MinsiButton>
      </div>
    </GlassCard>
  );
}

function CitySection() {
  return (
    <GlassCard as="section" className={styles.cityPanel} aria-labelledby="research-city-title">
      <div className={styles.cityHeader}>
        <h2 id="research-city-title">来自这些地方</h2>
        <p>地区仅精确到城市，用来理解不同环境下的产品体验。</p>
      </div>
      <div className={styles.cityList}>
        {cities.map((city) => (
          <span key={city}>{city}</span>
        ))}
      </div>
      <div className={styles.cityNotice}>
        <ResearchIcon type="shield" />
        <p>所有内容经审核后匿名展示。你可以随时要求删除自己主动提交的反馈。</p>
      </div>
    </GlassCard>
  );
}

function ResearchSubmitButton() {
  return (
    <MinsiButton type="button" variant="primary" size="lg" className={`minsi-button ${styles.submitButton}`}>
      匿名提交想法
      <ResearchIcon type="send" />
    </MinsiButton>
  );
}

function ShareSection() {
  return (
    <GlassCard as="section" className={styles.sharePanel} aria-labelledby="research-share-title" id="share">
      <div className={styles.shareIntro}>
        <span>
          <ResearchIcon type="comment" />
        </span>
        <div>
          <h2 id="research-share-title">想分享你的想法吗？</h2>
          <p id="privacy">参与研究是自愿的，你可以随时退出。Minsi 不保存聊天内容，退出后自动清除；你主动提交的反馈只用于改进产品体验和安全说明。</p>
        </div>
      </div>
      <form className={styles.shareForm}>
        <div className={styles.feedbackColumn}>
          <label className={styles.feedbackInput}>
            <span>你的反馈</span>
            <textarea placeholder="写下你使用 Minsi 时的真实感受，几句话也可以..." maxLength={500} />
            <small>0 / 500</small>
          </label>
          <div className={`${styles.submitRow} ${styles.desktopSubmitRow}`}>
            <ResearchSubmitButton />
          </div>
        </div>
        <fieldset className={styles.checkboxGroup}>
          <legend>你最在意的体验（可多选）</legend>
          <div>
            {experienceOptions.map((option) => (
              <label key={option}>
                <input type="checkbox" name="experience" value={option} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.radioGroup}>
          <legend>你觉得 Minsi 有帮助吗？</legend>
          <label>
            <input type="radio" name="helpful" value="very" />
            <span>很有帮助</span>
          </label>
          <label>
            <input type="radio" name="helpful" value="some" />
            <span>有一点帮助</span>
          </label>
          <label>
            <input type="radio" name="helpful" value="unsure" defaultChecked />
            <span>还不确定</span>
          </label>
        </fieldset>
        <div className={`${styles.submitRow} ${styles.mobileSubmitRow}`}>
          <ResearchSubmitButton />
        </div>
      </form>
      <SafetyNotice className={styles.formSafety} />
    </GlassCard>
  );
}

function ResearchFooter() {
  return (
    <footer className={styles.footer}>
      <p>© 2026 Minsi.ai. All rights reserved.</p>
    </footer>
  );
}

export function UserResearchPage() {
  return (
    <main className={styles.page}>
      <SiteHeaderOverlay logoHref="/" activeNav="research" />
      <div className={styles.mobileHeaderShell}>
        <SiteHeader variant="mobile" logoHref="/" />
      </div>
      <div className={styles.canvas}>
        <HeroSection />
        <MetricsSection />
        <ResearchGuideSection />
        <FeedbackSection />
        <CitySection />
        <ShareSection />
        <ResearchFooter />
      </div>
    </main>
  );
}
