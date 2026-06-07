import Image from "next/image";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";
import { EmotionLanguageCarousel } from "./EmotionLanguageCarousel";

const aboutAsset = (name: string) => `/assets/about/${name}`;

interface EmotionState {
  title: string;
  body: string;
  image: string;
  width: number;
  height: number;
}

interface AbilityCard {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  align: "left" | "right";
}

interface TimelineItem {
  version: string;
  title: string;
  body: string;
}

interface ConcernItem {
  title: string;
  icon: "lock" | "message" | "save";
}

const emotionStates: EmotionState[] = [
  {
    title: "平静",
    body: "慢慢呼吸，\n陪你稳定下来。",
    image: "emotion-calm.png",
    width: 112,
    height: 72
  },
  {
    title: "焦虑",
    body: "提醒你放慢，\n而不是催你\n马上好起来。",
    image: "emotion-anxious.png",
    width: 112,
    height: 78
  },
  {
    title: "迷茫",
    body: "允许你\n暂时说不清楚。",
    image: "emotion-lost.png",
    width: 112,
    height: 78
  },
  {
    title: "希望",
    body: "帮你看到\n一点点可能。",
    image: "emotion-hope.png",
    width: 112,
    height: 74
  },
  {
    title: "清晰",
    body: "把混乱的想法\n整理出来。",
    image: "emotion-clear.png",
    width: 118,
    height: 72
  },
  {
    title: "连接",
    body: "让你感觉\n不是一个人。",
    image: "emotion-connect.png",
    width: 124,
    height: 81
  }
];

const abilityCards: AbilityCard[] = [
  {
    title: "不知道怎么开口时",
    body: "你可以先说一句很短的话，或只打几个字，Minsi 会陪你一点点展开。",
    image: "ability-open.png",
    imageAlt: "Minsi 陪伴用户从一句话开始表达",
    align: "left"
  },
  {
    title: "情绪很乱时",
    body: "Minsi 会陪你把感受、原因和想法慢慢分开，让混乱变得清晰一点。",
    image: "ability-messy.png",
    imageAlt: "Minsi 陪伴用户整理混乱的想法",
    align: "right"
  },
  {
    title: "担心隐私时",
    body: "聊天内容不保存，退出后自动清除，也不会长期追踪你的表达。",
    image: "ability-privacy.png",
    imageAlt: "Minsi 用安全边界守护表达内容",
    align: "right"
  }
];

const timelineItems: TimelineItem[] = [
  {
    version: "V1",
    title: "文字聊天原型",
    body: "先验证用户是否愿意向 AI 表达情绪。"
  },
  {
    version: "V2",
    title: "加入语音入口",
    body: "因为有用户说，说出来时反而更容易开口。"
  },
  {
    version: "V3",
    title: "强化隐私说明",
    body: "把用户最关心的“我的内容不会被别人看到”讲清楚。"
  },
  {
    version: "V4",
    title: "优化移动端界面",
    body: "让手机上的陪伴入口更轻、更清楚。"
  }
];

const concernItems: ConcernItem[] = [
  {
    title: "隐私会不会被看到？",
    icon: "lock"
  },
  {
    title: "不知道怎么开口怎么办？",
    icon: "message"
  },
  {
    title: "Minsi 会不会保存我的话？",
    icon: "save"
  }
];

function SectionTitle({ children, id }: { children: string; id?: string }) {
  return (
    <div className="about-section-title">
      <h2 id={id}>{children}</h2>
      <Image src={aboutAsset("section-heart.svg")} alt="" width={56} height={56} aria-hidden />
    </div>
  );
}

function ProjectIcon({ icon }: { icon: ConcernItem["icon"] }) {
  if (icon === "message") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6.5h14v9.2H9.8L6 19v-3.3H5V6.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8.2 10.2h7.6M8.2 12.8h4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "save") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.2 4.7h9.9l2.2 2.2v12.4H6.2V4.7Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 4.8v5h6v-5M9 15h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="10" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 10V8.2a3.5 3.5 0 0 1 7 0V10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function AboutHero() {
  return (
    <section className="about-hero" aria-labelledby="about-hero-title">
      <Image className="about-hero-bg" src={aboutAsset("hero-bg.png")} alt="" width={2890} height={1282} priority sizes="(min-width: 1024px) 1440px, 100vw" aria-hidden />
      <div className="about-hero-note" aria-hidden>
        <span className="about-hero-note-scrim" />
        <Image className="about-hero-note-paper" src="/figma-assets/sticky-pink.png" alt="" width={892} height={749} draggable={false} />
        <p className="about-hero-note-line about-hero-note-line-one">你已经</p>
        <p className="about-hero-note-line about-hero-note-line-two">很棒了！</p>
      </div>
      <div className="about-hero-copy">
        <div className="about-hero-title-wrap">
          <h1 id="about-hero-title">关于 Minsi</h1>
          <Image src={aboutAsset("sparkle-outline.svg")} alt="" width={45} height={41} aria-hidden />
        </div>
        <p className="about-hero-kicker">一个为青少年设计的 AI 情绪陪伴空间</p>
        <p className="about-hero-body">你可以用语音或文字，说出那些一时不知道该怎么讲的话。Minsi 不评判，不打断，会陪你慢慢整理感受。</p>
        <MinsiButton href="/chat" variant="primary" size="lg" className="minsi-button about-primary-button">
          开始和 Minsi 聊聊 →
        </MinsiButton>
      </div>
    </section>
  );
}

function VideoIntroSection() {
  return (
    <GlassCard as="section" className="about-video-card" aria-labelledby="about-video-title">
      <div className="about-video-panel">
        <Image src={aboutAsset("video-panel.png")} alt="Minsi 视频预览画面：我在这里，听你说。" width={622} height={350} sizes="(min-width: 1024px) 622px, 100vw" />
      </div>
      <div className="about-video-copy">
        <SectionTitle id="about-video-title">30 秒了解 Minsi</SectionTitle>
        <p>从一个“不知道怎么讲”的瞬间开始，看看 Minsi 如何陪你慢慢说出来。</p>
        <MinsiButton href="/chat" variant="ghost" size="lg" className="minsi-button about-secondary-button">
          播放视频
          <Image src={aboutAsset("play-icon.svg")} alt="" width={43} height={43} aria-hidden />
        </MinsiButton>
      </div>
    </GlassCard>
  );
}

function WhyMinsiSection() {
  return (
    <section className="about-why" aria-labelledby="about-why-title">
      <div className="about-why-copy">
        <SectionTitle id="about-why-title">为什么做 Minsi</SectionTitle>
        <p className="about-why-lead">Minsi 的开始，其实来自一句很简单的话：“我不知道怎么讲。”</p>
        <p>我发现，很多时候我们不是没有感受，也不是不想求助，而是不知道第一句话该怎么说。尤其是一些很小、很乱、说出来又怕被误解的情绪，常常会被我们自己压下去。</p>
        <p>所以我想做 Minsi。它不是为了立刻给出答案，而是先接住那个还没说清楚的瞬间，陪你慢慢开始。</p>
      </div>
      <Image className="about-why-image" src={aboutAsset("story-card.png")} alt="Minsi 陪伴用户从不知道怎么讲的时刻开始表达" width={1370} height={628} sizes="(min-width: 1024px) 680px, 100vw" />
    </section>
  );
}

function EmotionLanguageSection() {
  return (
    <GlassCard as="section" className="about-emotion-card" aria-labelledby="about-emotion-title">
      <SectionTitle id="about-emotion-title">Minsi 的情绪语言</SectionTitle>
      <p className="about-emotion-intro">Minsi 的 Logo 不只是一个标志，它也可以表达陪伴的状态：平静、焦虑、迷茫、希望、清晰与连接。</p>
      <div className="about-emotion-grid">
        {emotionStates.map((state) => (
          <article className="about-emotion-item" key={state.title}>
            <Image src={aboutAsset(state.image)} alt="" width={state.width} height={state.height} sizes="124px" aria-hidden />
            <h3>{state.title}</h3>
            <p>{state.body}</p>
          </article>
        ))}
      </div>
      <EmotionLanguageCarousel items={emotionStates} />
    </GlassCard>
  );
}

function AbilitySection() {
  return (
    <section className="about-abilities" aria-labelledby="about-ability-title">
      <SectionTitle id="about-ability-title">Minsi 可以陪你做什么</SectionTitle>
      <div className="about-ability-grid">
        {abilityCards.map((card) => (
          <article className={`about-ability-card about-ability-card-${card.align}`} key={card.title}>
            <Image src={aboutAsset(card.image)} alt={card.imageAlt} fill sizes="(min-width: 1024px) 390px, 100vw" />
            <div className="about-ability-copy">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function UserVoicesCard() {
  return (
    <GlassCard as="article" className="about-story-card about-voice-card">
      <h3>真实用户声音</h3>
      <div className="about-user-quote">
        <Image src={aboutAsset("user-avatar-1-real.png")} alt="" width={83} height={82} aria-hidden />
        <blockquote>有时候我不是想要答案，只是想先把话说出来。</blockquote>
        <p>一位高一学生</p>
      </div>
      <div className="about-user-quote">
        <Image src={aboutAsset("user-avatar-2-real.png")} alt="" width={83} height={79} aria-hidden />
        <blockquote>当我不知道怎么开口时，Minsi 让我觉得可以慢慢来。</blockquote>
        <p>一位初二学生</p>
      </div>
      <a className="about-text-link" href="/research">
        查看更多用户心声 →
      </a>
    </GlassCard>
  );
}

function TimelineCard() {
  return (
    <GlassCard as="article" className="about-story-card about-timeline-card">
      <h3>设计迭代过程</h3>
      <div className="about-timeline">
        {timelineItems.map((item) => (
          <div className="about-timeline-item" key={item.version}>
            <span>{item.version}</span>
            <div>
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
      <a className="about-text-link" href="/research">
        查看完整迭代记录 →
      </a>
    </GlassCard>
  );
}

function MetricsCard() {
  return (
    <GlassCard as="article" className="about-story-card about-metrics-card">
      <h3>
        数据看板 <span>持续更新中</span>
      </h3>
      <div className="about-metric">
        <span className="about-metric-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.8 20c1.4-3.7 3.8-5.5 7.2-5.5s5.8 1.8 7.2 5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p>体验人数</p>
          <strong>2,362+</strong>
        </div>
      </div>
      <div className="about-metric">
        <span className="about-metric-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5.8h10v14H7v-14Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M9 4h6M9.4 12.2l1.7 1.7 3.8-4.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p>完成迭代</p>
          <strong>
            4 <small>次</small>
          </strong>
        </div>
      </div>
      <a className="about-text-link" href="/research">
        查看更多数据 →
      </a>
    </GlassCard>
  );
}

function ConcernsCard() {
  return (
    <GlassCard as="article" className="about-story-card about-concerns-card">
      <h3>用户最关心的问题 Top3</h3>
      <div className="about-concern-list">
        {concernItems.map((item) => (
          <div className="about-concern-pill" key={item.title}>
            <ProjectIcon icon={item.icon} />
            <span>{item.title}</span>
          </div>
        ))}
      </div>
      <a className="about-text-link" href="/research">
        查看更多问题 →
      </a>
    </GlassCard>
  );
}

function ProjectStorySection() {
  return (
    <section className="about-project" aria-labelledby="about-project-title">
      <SectionTitle id="about-project-title">项目故事</SectionTitle>
      <div className="about-story-grid">
        <UserVoicesCard />
        <TimelineCard />
        <MetricsCard />
        <ConcernsCard />
      </div>
    </section>
  );
}

function BottomCtas() {
  return (
    <section className="about-bottom-ctas" aria-label="Minsi 的边界与共创">
      <GlassCard as="article" className="about-bottom-card">
        <div className="about-bottom-copy about-bottom-copy-wide">
          <h2>Minsi 的边界</h2>
          <SafetyNotice
            className="about-boundary-notice"
            text="Minsi 不是医生或心理治疗师，不能替代专业帮助；聊天内容不保存，退出后自动清除。"
          />
          <MinsiButton href="/privacy" variant="ghost" size="sm" className="minsi-button about-outline-button">
            获取帮助资源 →
          </MinsiButton>
        </div>
        <Image className="about-bottom-image about-boundary-image" src={aboutAsset("boundary.png")} alt="" width={146} height={167} aria-hidden />
      </GlassCard>
      <GlassCard as="article" className="about-bottom-card">
        <div className="about-bottom-copy">
          <h2>和 Minsi 一起成长</h2>
          <p>你的真实感受很重要，会帮助 Minsi 变得更安全、更温暖，也更懂你。</p>
          <MinsiButton href="/research" variant="primary" size="sm" className="minsi-button about-primary-small-button">
            分享你的想法 →
          </MinsiButton>
        </div>
        <Image className="about-bottom-image about-grow-image" src={aboutAsset("grow.png")} alt="" width={267} height={180} aria-hidden />
      </GlassCard>
    </section>
  );
}

function AboutFooter() {
  return (
    <footer className="about-footer">
      <p>© 2026 Minsi.ai. All rights reserved.</p>
    </footer>
  );
}

export function AboutMinsiPage() {
  return (
    <main className="about-minsi-page">
      <SiteHeaderOverlay logoHref="/" activeNav="about" />
      <div className="about-mobile-header-shell">
        <SiteHeader variant="mobile" logoHref="/" />
      </div>
      <div className="about-page-canvas">
        <AboutHero />
        <VideoIntroSection />
        <WhyMinsiSection />
        <EmotionLanguageSection />
        <AbilitySection />
        <ProjectStorySection />
        <BottomCtas />
        <AboutFooter />
      </div>
    </main>
  );
}
