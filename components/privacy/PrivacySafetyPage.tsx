"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSafetyResources, isPlaceholderSafetyResource, type SafetyResource } from "../../lib/api/safety";
import { pushProtectedRoute } from "../../lib/auth/protected-navigation";
import { privacyMessages, type PrivacyMessages } from "../../lib/i18n/messages";
import type { MinsiLang } from "../../lib/i18n/language";
import { useLanguagePreference } from "../../lib/i18n/useLanguagePreference";
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

type SafetyResourcesStatus = "loading" | "ready" | "error";

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

function InfoList({ items, compact = false }: { items: readonly InfoItem[]; compact?: boolean }) {
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

function PrivacyModeCard({ copy }: { copy: PrivacyMessages }) {
  return (
    <aside className={styles.modePanel} aria-label={copy.mode.ariaLabel}>
      <h2>{copy.mode.title}</h2>
      <div className={styles.modeCard}>
        <div>
          <span className={styles.liveDot} aria-hidden="true" />
          <strong>{copy.mode.live}</strong>
          {copy.mode.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <Image className={styles.modeShield} src="/assets/about/boundary.png" alt="" width={146} height={167} draggable={false} />
      </div>
      <InfoList items={copy.mode.items} compact />
      <p className={styles.modeHint}>{copy.mode.hint}</p>
    </aside>
  );
}

function DataTreatmentSection({ copy }: { copy: PrivacyMessages }) {
  return (
    <GlassCard as="section" className={styles.dataCard} aria-labelledby="privacy-data-title">
      <div className={styles.dataCopy}>
        <SectionTitle>
          <span id="privacy-data-title">{copy.data.title}</span>
        </SectionTitle>
        <InfoList items={copy.data.items} />
        <p className={styles.dataFootnote}>
          <DataIcon name="lock" />
          {copy.data.footnote}
        </p>
      </div>
      <PrivacyModeCard copy={copy} />
    </GlassCard>
  );
}

function BoundarySection({ copy }: { copy: PrivacyMessages }) {
  return (
    <GlassCard as="section" className={styles.boundaryCard} id="safety-boundary" aria-labelledby="privacy-boundary-title">
      <div className={styles.boundaryImageWrap}>
        <Image className={styles.boundaryCloud} src="/figma-assets/cloud.png" alt="" width={360} height={268} sizes="(max-width: 767px) 180px, 240px" draggable={false} />
      </div>
      <div className={styles.boundaryCopy}>
        <h2 id="privacy-boundary-title">{copy.boundary.title}</h2>
        <p>{copy.boundary.body}</p>
      </div>
      <div className={styles.boundaryLists}>
        <div>
          <h3>{copy.boundary.canDoTitle}</h3>
          <InfoList items={copy.boundary.canDo} compact />
        </div>
        <div>
          <h3>{copy.boundary.dangerTitle}</h3>
          <InfoList items={copy.boundary.danger} compact />
        </div>
      </div>
      <SafetyNotice variant="mobile" className={styles.boundaryNotice} text={copy.safetyText} />
    </GlassCard>
  );
}

function SafetyResourcesSection({ copy, lang }: { copy: PrivacyMessages; lang: MinsiLang }) {
  const [status, setStatus] = useState<SafetyResourcesStatus>("loading");
  const [resources, setResources] = useState<SafetyResource[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      setStatus("loading");
      try {
        const nextResources = await getSafetyResources(lang);
        if (!cancelled) {
          setResources(nextResources);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setResources([]);
          setStatus("error");
        }
      }
    }

    void loadResources();

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const hasPlaceholderResources = status === "ready" && (resources.length === 0 || resources.some(isPlaceholderSafetyResource));

  return (
    <GlassCard as="section" className={styles.resourcesCard} id="safety-resources" aria-labelledby="privacy-resources-title">
      <div className={styles.resourcesIntro}>
        <SectionTitle>
          <span id="privacy-resources-title">{copy.resources.title}</span>
        </SectionTitle>
        <p>{copy.resources.intro}</p>
      </div>

      {hasPlaceholderResources ? (
        <div className={styles.resourceVerificationNotice} role="status">
          <span className={styles.resourceNoticeIcon}>
            <DataIcon name="shield" />
          </span>
          <span>
            <strong>{copy.resources.verificationTitle}</strong>
            <p>{copy.resources.verificationBody}</p>
          </span>
        </div>
      ) : null}

      {status === "loading" ? (
        <p className={styles.resourceState}>{copy.resources.loading}</p>
      ) : null}

      {status === "error" ? (
        <p className={styles.resourceState}>{copy.resources.error}</p>
      ) : null}

      {status === "ready" && resources.length > 0 ? (
        <ul className={styles.resourcesList}>
          {resources.map((resource) => {
            const isPlaceholder = isPlaceholderSafetyResource(resource);

            return (
              <li className={styles.resourceItem} key={resource.id}>
                <strong>{resource.name}</strong>
                <span className={styles.resourceMeta}>{isPlaceholder ? copy.resources.placeholderAvailable : resource.available}</span>
                <span className={`${styles.resourceContact} ${isPlaceholder ? styles.resourceContactHidden : ""}`}>
                  {isPlaceholder ? copy.resources.placeholderContact : resource.contact}
                </span>
                {resource.disclaimer ? <small className={styles.resourceDisclaimer}>{resource.disclaimer}</small> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </GlassCard>
  );
}

function FaqSection({ copy }: { copy: PrivacyMessages }) {
  return (
    <GlassCard as="section" className={styles.faqCard} id="privacy-questions" aria-labelledby="privacy-faq-title">
      <SectionTitle>
        <span id="privacy-faq-title">{copy.faq.title}</span>
      </SectionTitle>
      <div className={styles.faqGrid}>
        {copy.faq.items.map((item) => (
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

function RulesCallout({ copy }: { copy: PrivacyMessages }) {
  return (
    <GlassCard as="section" className={styles.rulesCard} aria-labelledby="privacy-rules-title">
      <Image className={styles.rulesIcon} src="/figma-assets/login-lock.svg" alt="" width={112} height={112} draggable={false} />
      <div className={styles.rulesCopy}>
        <h2 id="privacy-rules-title">{copy.rules.title}</h2>
        <p>{copy.rules.body}</p>
        <small>{copy.rules.note}</small>
      </div>
      <div className={styles.rulesActions}>
        <MinsiButton type="button" variant="ghost" size="sm" className={`minsi-button ${styles.policyButton}`}>
          {copy.rules.privacy}
        </MinsiButton>
        <MinsiButton type="button" variant="ghost" size="sm" className={`minsi-button ${styles.policyButton}`}>
          {copy.rules.terms}
        </MinsiButton>
      </div>
    </GlassCard>
  );
}

export function PrivacySafetyPage() {
  const router = useRouter();
  const { lang, changeLanguage } = useLanguagePreference();
  const copy = privacyMessages[lang];
  const [isChatOpening, setIsChatOpening] = useState(false);
  const [chatOpenError, setChatOpenError] = useState("");

  async function handleStartChat() {
    if (isChatOpening) {
      return;
    }

    setChatOpenError("");
    setIsChatOpening(true);

    try {
      await pushProtectedRoute(router, "/chat");
    } catch {
      setChatOpenError(copy.hero.error);
    } finally {
      setIsChatOpening(false);
    }
  }

  return (
    <main className={styles.page}>
      <SiteHeaderOverlay activeNav="privacy" showNav showLogin logoHref="/" localized lang={lang} onLanguageChange={changeLanguage} />
      <div className={styles.mobileHeaderShell}>
        <SiteHeader variant="mobile" logoHref="/" localized lang={lang} onLanguageChange={changeLanguage} />
      </div>

      <div className={styles.canvas}>
        <section className={styles.hero} aria-labelledby="privacy-hero-title">
          <Image className={styles.heroBg} src="/assets/privacy/hero-bg.png" alt="" fill sizes="(max-width: 1023px) 100vw, 1440px" priority draggable={false} />
          <div className={styles.heroVeil} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <h1 id="privacy-hero-title">
              <span>{copy.hero.titleLines[0]}</span>
              <strong>{copy.hero.titleLines[1]}</strong>
            </h1>
            <Image className={styles.heroHeart} src="/figma-assets/heart.svg" alt="" width={44} height={44} draggable={false} />
            <p>{copy.hero.body}</p>
            <MinsiButton
              type="button"
              variant="primary"
              size="lg"
              className={`minsi-button ${styles.heroChatButton}`}
              loading={isChatOpening}
              aria-busy={isChatOpening}
              aria-describedby={chatOpenError ? "privacy-chat-entry-error" : undefined}
              onClick={handleStartChat}
            >
              {isChatOpening ? copy.hero.checking : copy.hero.startChat}
            </MinsiButton>
            {chatOpenError ? (
              <span id="privacy-chat-entry-error" className={styles.heroChatError} role="status" aria-live="polite">
                {chatOpenError}
              </span>
            ) : null}
          </div>
        </section>

        <section className={styles.commitments} aria-label={copy.commitmentsLabel}>
          {copy.commitments.map((card) => (
            <CommitmentCard key={card.title} {...card} />
          ))}
        </section>

        <DataTreatmentSection copy={copy} />
        <BoundarySection copy={copy} />
        <SafetyResourcesSection copy={copy} lang={lang} />
        <FaqSection copy={copy} />
        <RulesCallout copy={copy} />

        <footer className={styles.footer}>
          <p>© 2026 Minsi.ai. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
