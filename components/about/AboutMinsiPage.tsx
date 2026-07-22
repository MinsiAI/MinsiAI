"use client";

import Image from "next/image";
import { AboutChatButton } from "./AboutChatButton";
import { GlassCard } from "../site/GlassCard";
import { MinsiButton } from "../site/MinsiButton";
import { SafetyNotice } from "../site/SafetyNotice";
import { SiteHeader } from "../site/SiteHeader";
import { SiteHeaderOverlay } from "../site/SiteHeaderOverlay";
import { EmotionLanguageCarousel } from "./EmotionLanguageCarousel";
import { aboutMessages, type AboutMessages } from "../../lib/i18n/messages";
import { useLanguagePreference } from "../../lib/i18n/useLanguagePreference";

const aboutAsset = (name: string) => `/assets/about/${name}`;

type ConcernIcon = AboutMessages["story"]["concerns"][number]["icon"];

function SectionTitle({ children, id }: { children: string; id?: string }) {
  return (
    <div className="about-section-title">
      <h2 id={id}>{children}</h2>
      <Image src={aboutAsset("section-heart.svg")} alt="" width={56} height={56} aria-hidden />
    </div>
  );
}

function ProjectIcon({ icon }: { icon: ConcernIcon }) {
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

function AboutHero({ copy }: { copy: AboutMessages }) {
  return (
    <section className="about-hero" aria-labelledby="about-hero-title">
      <Image className="about-hero-bg" src={aboutAsset("hero-bg.png")} alt="" width={2890} height={1282} priority sizes="(min-width: 1024px) 1440px, 100vw" aria-hidden />
      <div className="about-hero-note" aria-hidden>
        <span className="about-hero-note-scrim" />
        <Image className="about-hero-note-paper" src="/figma-assets/sticky-pink.png" alt="" width={892} height={749} draggable={false} />
        <p className="about-hero-note-line about-hero-note-line-one">{copy.hero.noteLines[0]}</p>
        <p className="about-hero-note-line about-hero-note-line-two">{copy.hero.noteLines[1]}</p>
      </div>
      <div className="about-hero-copy">
        <div className="about-hero-title-wrap">
          <h1 id="about-hero-title">{copy.hero.title}</h1>
          <Image src={aboutAsset("sparkle-outline.svg")} alt="" width={45} height={41} aria-hidden />
        </div>
        <p className="about-hero-kicker">{copy.hero.kicker}</p>
        <p className="about-hero-body">{copy.hero.body}</p>
        <AboutChatButton variant="primary" size="lg" className="minsi-button about-primary-button" errorText={copy.chatError}>
          {copy.hero.cta}
        </AboutChatButton>
      </div>
    </section>
  );
}

function VideoIntroSection({ copy }: { copy: AboutMessages }) {
  return (
    <GlassCard as="section" className="about-video-card" aria-labelledby="about-video-title">
      <div className="about-video-panel">
        <Image src={aboutAsset("video-panel.png")} alt={copy.video.imageAlt} width={622} height={350} sizes="(min-width: 1024px) 622px, 100vw" />
      </div>
      <div className="about-video-copy">
        <SectionTitle id="about-video-title">{copy.video.title}</SectionTitle>
        <p>{copy.video.body}</p>
        <AboutChatButton variant="ghost" size="lg" className="minsi-button about-secondary-button" errorText={copy.chatError}>
          {copy.video.action}
          <Image src={aboutAsset("play-icon.svg")} alt="" width={43} height={43} aria-hidden />
        </AboutChatButton>
      </div>
    </GlassCard>
  );
}

function WhyMinsiSection({ copy }: { copy: AboutMessages }) {
  return (
    <section className="about-why" aria-labelledby="about-why-title">
      <div className="about-why-copy">
        <SectionTitle id="about-why-title">{copy.why.title}</SectionTitle>
        <p className="about-why-lead">{copy.why.lead}</p>
        {copy.why.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Image className="about-why-image" src={aboutAsset("story-card.png")} alt={copy.why.imageAlt} width={1370} height={628} sizes="(min-width: 1024px) 680px, 100vw" />
    </section>
  );
}

function EmotionLanguageSection({ copy }: { copy: AboutMessages }) {
  return (
    <GlassCard as="section" className="about-emotion-card" aria-labelledby="about-emotion-title">
      <SectionTitle id="about-emotion-title">{copy.emotion.title}</SectionTitle>
      <p className="about-emotion-intro">{copy.emotion.intro}</p>
      <div className="about-emotion-grid">
        {copy.emotion.items.map((state) => (
          <article className="about-emotion-item" key={state.title}>
            <Image src={aboutAsset(state.image)} alt="" width={state.width} height={state.height} sizes="124px" aria-hidden />
            <h3>{state.title}</h3>
            <p>{state.body}</p>
          </article>
        ))}
      </div>
      <EmotionLanguageCarousel items={copy.emotion.items} ariaLabel={copy.emotion.carouselLabel} dotsLabel={copy.emotion.dotsLabel} viewLabelPrefix={copy.emotion.viewLabelPrefix} />
    </GlassCard>
  );
}

function AbilitySection({ copy }: { copy: AboutMessages }) {
  return (
    <section className="about-abilities" aria-labelledby="about-ability-title">
      <SectionTitle id="about-ability-title">{copy.ability.title}</SectionTitle>
      <div className="about-ability-grid">
        {copy.ability.items.map((card) => (
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

function UserVoicesCard({ copy }: { copy: AboutMessages }) {
  return (
    <GlassCard as="article" className="about-story-card about-voice-card">
      <h3>{copy.story.voicesTitle}</h3>
      {copy.story.voices.map((voice) => (
        <div className="about-user-quote" key={voice.quote}>
          <Image src={aboutAsset(voice.image)} alt="" width={voice.width} height={voice.height} aria-hidden />
          <blockquote>{voice.quote}</blockquote>
          <p>{voice.byline}</p>
        </div>
      ))}
      <a className="about-text-link" href="/research">
        {copy.story.moreVoices}
      </a>
    </GlassCard>
  );
}

function TimelineCard({ copy }: { copy: AboutMessages }) {
  return (
    <GlassCard as="article" className="about-story-card about-timeline-card">
      <h3>{copy.story.timelineTitle}</h3>
      <div className="about-timeline">
        {copy.story.timeline.map((item) => (
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
        {copy.story.moreTimeline}
      </a>
    </GlassCard>
  );
}

function MetricsCard({ copy }: { copy: AboutMessages }) {
  return (
    <GlassCard as="article" className="about-story-card about-metrics-card">
      <h3>
        {copy.story.metricsTitle} <span>{copy.story.metricsBadge}</span>
      </h3>
      <div className="about-metric">
        <span className="about-metric-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.8 20c1.4-3.7 3.8-5.5 7.2-5.5s5.8 1.8 7.2 5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p>{copy.story.userCount}</p>
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
          <p>{copy.story.iterationCount}</p>
          <strong>
            4 <small>{copy.story.timesUnit}</small>
          </strong>
        </div>
      </div>
      <a className="about-text-link" href="/research">
        {copy.story.moreData}
      </a>
    </GlassCard>
  );
}

function ConcernsCard({ copy }: { copy: AboutMessages }) {
  return (
    <GlassCard as="article" className="about-story-card about-concerns-card">
      <h3>{copy.story.concernsTitle}</h3>
      <div className="about-concern-list">
        {copy.story.concerns.map((item) => (
          <div className="about-concern-pill" key={item.title}>
            <ProjectIcon icon={item.icon} />
            <span>{item.title}</span>
          </div>
        ))}
      </div>
      <a className="about-text-link" href="/research">
        {copy.story.moreQuestions}
      </a>
    </GlassCard>
  );
}

function ProjectStorySection({ copy }: { copy: AboutMessages }) {
  return (
    <section className="about-project" aria-labelledby="about-project-title">
      <SectionTitle id="about-project-title">{copy.story.title}</SectionTitle>
      <div className="about-story-grid">
        <UserVoicesCard copy={copy} />
        <TimelineCard copy={copy} />
        <MetricsCard copy={copy} />
        <ConcernsCard copy={copy} />
      </div>
    </section>
  );
}

function BottomCtas({ copy }: { copy: AboutMessages }) {
  return (
    <section className="about-bottom-ctas" aria-label={copy.bottom.ariaLabel}>
      <GlassCard as="article" className="about-bottom-card">
        <div className="about-bottom-copy about-bottom-copy-wide">
          <h2>{copy.bottom.boundaryTitle}</h2>
          <SafetyNotice
            className="about-boundary-notice"
            text={copy.bottom.boundaryText}
          />
          <MinsiButton href="/privacy" variant="ghost" size="sm" className="minsi-button about-outline-button">
            {copy.bottom.resources}
          </MinsiButton>
        </div>
        <Image className="about-bottom-image about-boundary-image" src={aboutAsset("boundary.png")} alt="" width={146} height={167} aria-hidden />
      </GlassCard>
      <GlassCard as="article" className="about-bottom-card">
        <div className="about-bottom-copy">
          <h2>{copy.bottom.growTitle}</h2>
          <p>{copy.bottom.growBody}</p>
          <MinsiButton href="/research" variant="primary" size="sm" className="minsi-button about-primary-small-button">
            {copy.bottom.share}
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
  const { lang, changeLanguage } = useLanguagePreference();
  const copy = aboutMessages[lang];

  return (
    <main className="about-minsi-page">
      <SiteHeaderOverlay logoHref="/" activeNav="about" localized lang={lang} onLanguageChange={changeLanguage} />
      <div className="about-mobile-header-shell">
        <SiteHeader variant="mobile" logoHref="/" localized lang={lang} onLanguageChange={changeLanguage} />
      </div>
      <div className="about-page-canvas">
        <AboutHero copy={copy} />
        <VideoIntroSection copy={copy} />
        <WhyMinsiSection copy={copy} />
        <EmotionLanguageSection copy={copy} />
        <AbilitySection copy={copy} />
        <ProjectStorySection copy={copy} />
        <BottomCtas copy={copy} />
        <AboutFooter />
      </div>
    </main>
  );
}
