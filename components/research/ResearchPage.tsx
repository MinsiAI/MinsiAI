"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ApiFetchError } from "../../lib/api/http";
import { getApprovedResearchFeedback, getResearchFeedbackMetrics, submitResearchFeedback } from "../../lib/api/research";
import type { ApprovedResearchFeedback, ResearchFeedbackMetrics, ResearchFeedbackRating } from "../../lib/api/research";
import { researchMessages, type ResearchMessages } from "../../lib/i18n/messages";
import { useLanguagePreference } from "../../lib/i18n/useLanguagePreference";
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

interface FeedbackItem {
  city: string;
  body: string;
  tag: string;
}

type SubmitStatus = "idle" | "success" | "error";

const defaultResearchMetrics: ResearchFeedbackMetrics = {
  userCount: 0,
  approvedFeedbackCount: 0,
  coveredRegionCount: 0,
  voluntaryPercent: 0,
  regions: []
};
const feedbackMaxLength = 1000;

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

function HeroSection({ copy }: { copy: ResearchMessages }) {
  return (
    <section className={styles.hero} aria-labelledby="research-hero-title">
      <div className={styles.heroCopy}>
        <div className={styles.heroTitleWrap}>
          <h1 id="research-hero-title">{copy.hero.title}</h1>
          <ResearchIcon type="sparkle" className={styles.heroSparkle} />
        </div>
        <p className={styles.heroLead}>{copy.hero.lead}</p>
        <div className={styles.heroActions}>
          <MinsiButton href="#share" variant="primary" size="lg" className={`minsi-button ${styles.primaryButton}`}>
            {copy.hero.share}
          </MinsiButton>
          <MinsiButton href="#privacy" variant="soft" size="lg" className={`minsi-button ${styles.secondaryButton}`}>
            {copy.hero.privacy}
          </MinsiButton>
        </div>
        <div className={styles.trustList} aria-label={copy.hero.trustLabel}>
          {copy.hero.trustItems.map((item) => (
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
        <Image src={researchAsset("hero-cloud-logo-balanced.png")} alt={copy.hero.imageAlt} width={1748} height={861} priority sizes="(min-width: 1024px) 716px, 100vw" />
      </div>
    </section>
  );
}

function MetricsSection({ metrics, label }: { metrics: Metric[]; label: string }) {
  return (
    <GlassCard as="section" className={styles.metricsPanel} aria-label={label}>
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

function ResearchGuideSection({ copy }: { copy: ResearchMessages }) {
  return (
    <section className={styles.guideSection} aria-labelledby="research-guide-title">
      <SectionHeading id="research-guide-title" title={copy.guide.title} body={copy.guide.body} />
      <ResearchGuideCarousel items={copy.guide.items} ariaLabel={copy.guide.carouselLabel} dotsLabel={copy.guide.dotsLabel} viewLabelPrefix={copy.guide.viewLabelPrefix} />
      <div className={styles.guideGrid}>
        {copy.guide.items.map((item) => (
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
      <GlassCard as="aside" className={styles.suitablePanel} aria-label={copy.guide.suitableLabel}>
        <div>
          <ResearchIcon type="people" />
          <h3>{copy.guide.suitableTitle}</h3>
        </div>
        <ul>
          {copy.guide.suitableItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}

function FeedbackSection({ items, copy }: { items: FeedbackItem[]; copy: ResearchMessages }) {
  return (
    <GlassCard as="section" className={styles.feedbackPanel} aria-labelledby="research-feedback-title">
      <div className={styles.panelHeader}>
        <div>
          <h2 id="research-feedback-title">{copy.feedback.title}</h2>
          <span aria-hidden="true" />
        </div>
        <div className={styles.filterList} aria-label={copy.feedback.filterLabel}>
          {copy.feedback.filters.map((filter, index) => (
            <button className={index === 0 ? styles.activeFilter : undefined} type="button" key={filter}>
              {filter}
            </button>
          ))}
        </div>
        <p className={styles.updating}>
          {copy.feedback.updating}
          <ResearchIcon type="refresh" />
        </p>
      </div>
      <ResearchFeedbackCarousel items={items} ariaLabel={copy.feedback.carouselLabel} dotsLabel={copy.feedback.dotsLabel} viewPrefix={copy.feedback.viewPrefix} viewSuffix={copy.feedback.viewSuffix} expandText={copy.feedback.expand} />
      <div className={styles.feedbackGrid}>
        {items.map((item, index) => (
          <article className={styles.feedbackCard} key={`${item.city}-${item.tag}-${index}`}>
            <div className={styles.feedbackMeta}>
              <ResearchIcon type="location" />
              <span>{item.city}</span>
            </div>
            <blockquote>{item.body}</blockquote>
            <div className={styles.feedbackFooter}>
              <span>{item.tag}</span>
              <button type="button">{copy.feedback.expand}</button>
            </div>
          </article>
        ))}
      </div>
      <div className={styles.feedbackMore}>
        <MinsiButton href="#share" variant="soft" size="sm" className={`minsi-button ${styles.softButton}`}>
          {copy.feedback.more}
        </MinsiButton>
      </div>
    </GlassCard>
  );
}

function CitySection({ cities, copy }: { cities: string[]; copy: ResearchMessages }) {
  return (
    <GlassCard as="section" className={styles.cityPanel} aria-labelledby="research-city-title">
      <div className={styles.cityHeader}>
        <h2 id="research-city-title">{copy.city.title}</h2>
        <p>{copy.city.body}</p>
      </div>
      <div className={styles.cityList}>
        {cities.map((city) => (
          <span key={city}>{city}</span>
        ))}
      </div>
      <div className={styles.cityNotice}>
        <ResearchIcon type="shield" />
        <p>{copy.city.notice}</p>
      </div>
    </GlassCard>
  );
}

function ResearchSubmitButton({ disabled, isSubmitting, copy }: { disabled: boolean; isSubmitting: boolean; copy: ResearchMessages["share"] }) {
  return (
    <MinsiButton type="submit" variant="primary" size="lg" className={`minsi-button ${styles.submitButton}`} disabled={disabled} loading={isSubmitting}>
      {isSubmitting ? copy.submitting : copy.submit}
      {!isSubmitting ? <ResearchIcon type="send" /> : null}
    </MinsiButton>
  );
}

function ShareSection({ copy }: { copy: ResearchMessages }) {
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [rating, setRating] = useState<ResearchFeedbackRating>("unsure");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const feedbackLength = useMemo(() => getCharLength(feedbackText), [feedbackText]);
  const canSubmit = feedbackLength > 0 && !isSubmitting;

  function handleFeedbackTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setFeedbackText(limitFeedbackText(event.currentTarget.value));
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
      setSubmitMessage("");
    }
  }

  function toggleExperience(option: string) {
    setSelectedExperiences((current) => {
      if (current.includes(option)) {
        return current.filter((item) => item !== option);
      }

      return [...current, option];
    });
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
      setSubmitMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedFeedbackText = feedbackText.trim();
    if (!normalizedFeedbackText) {
      setSubmitStatus("error");
      setSubmitMessage(copy.share.emptyError);
      return;
    }

    if (getCharLength(normalizedFeedbackText) > feedbackMaxLength) {
      setSubmitStatus("error");
      setSubmitMessage(copy.share.tooLongError.replace("{max}", String(feedbackMaxLength)));
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      await submitResearchFeedback({
        rating,
        feedbackTypes: selectedExperiences,
        feedbackText: normalizedFeedbackText
      });

      setFeedbackText("");
      setSelectedExperiences([]);
      setRating("unsure");
      setSubmitStatus("success");
      setSubmitMessage(copy.share.success);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(resolveSubmitErrorMessage(error, copy));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GlassCard as="section" className={styles.sharePanel} aria-labelledby="research-share-title" id="share">
      <div className={styles.shareIntro}>
        <span>
          <ResearchIcon type="comment" />
        </span>
        <div>
          <h2 id="research-share-title">{copy.share.title}</h2>
          <p id="privacy">{copy.share.privacy}</p>
        </div>
      </div>
      <form className={styles.shareForm} onSubmit={handleSubmit}>
        <div className={styles.feedbackColumn}>
          <label className={styles.feedbackInput}>
            <span>{copy.share.feedbackLabel}</span>
            <textarea aria-describedby="research-feedback-count research-submit-status" maxLength={feedbackMaxLength} onChange={handleFeedbackTextChange} placeholder={copy.share.placeholder} required value={feedbackText} />
            <small id="research-feedback-count">{feedbackLength} / {feedbackMaxLength}</small>
          </label>
          <div className={`${styles.submitRow} ${styles.desktopSubmitRow}`}>
            <ResearchSubmitButton disabled={!canSubmit} isSubmitting={isSubmitting} copy={copy.share} />
          </div>
        </div>
        <fieldset className={styles.checkboxGroup}>
          <legend>{copy.share.experienceLegend}</legend>
          <div>
            {copy.share.experienceOptions.map((option) => (
              <label key={option.value}>
                <input checked={selectedExperiences.includes(option.value)} name="experience" onChange={() => toggleExperience(option.value)} type="checkbox" value={option.value} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.radioGroup}>
          <legend>{copy.share.ratingLegend}</legend>
          {copy.share.ratingOptions.map((option) => (
            <label key={option.value}>
              <input checked={rating === option.value} name="helpful" onChange={() => setRating(option.value)} type="radio" value={option.value} />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        <div className={`${styles.submitRow} ${styles.mobileSubmitRow}`}>
          <ResearchSubmitButton disabled={!canSubmit} isSubmitting={isSubmitting} copy={copy.share} />
        </div>
        {submitStatus !== "idle" ? (
          <p className={`${styles.submitStatus} ${submitStatus === "success" ? styles.submitStatusSuccess : styles.submitStatusError}`} id="research-submit-status" role="status">
            {submitMessage}
          </p>
        ) : null}
      </form>
      <SafetyNotice className={styles.formSafety} text={copy.share.safetyText} />
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
  const { lang, changeLanguage } = useLanguagePreference();
  const copy = researchMessages[lang];
  const [approvedFeedbackItems, setApprovedFeedbackItems] = useState<FeedbackItem[]>([]);
  const [researchMetrics, setResearchMetrics] = useState<ResearchFeedbackMetrics>(defaultResearchMetrics);
  const metrics = useMemo(() => toMetrics(researchMetrics, copy), [copy, researchMetrics]);

  useEffect(() => {
    let cancelled = false;

    getApprovedResearchFeedback()
      .then((items) => {
        if (!cancelled) {
          setApprovedFeedbackItems(items.map((item) => toFeedbackItem(item, copy)).filter((item): item is FeedbackItem => item !== null));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApprovedFeedbackItems([]);
        }
      });

    getResearchFeedbackMetrics()
      .then((metrics) => {
        if (!cancelled) {
          setResearchMetrics(metrics);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResearchMetrics(defaultResearchMetrics);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [copy]);

  return (
    <main className={styles.page}>
      <SiteHeaderOverlay logoHref="/" activeNav="research" localized lang={lang} onLanguageChange={changeLanguage} />
      <div className={styles.mobileHeaderShell}>
        <SiteHeader variant="mobile" logoHref="/" localized lang={lang} onLanguageChange={changeLanguage} />
      </div>
      <div className={styles.canvas}>
        <HeroSection copy={copy} />
        <MetricsSection metrics={metrics} label={copy.metricsLabel} />
        <ResearchGuideSection copy={copy} />
        <FeedbackSection items={approvedFeedbackItems} copy={copy} />
        <CitySection cities={researchMetrics.regions} copy={copy} />
        <ShareSection copy={copy} />
        <ResearchFooter />
      </div>
    </main>
  );
}

function limitFeedbackText(value: string) {
  const chars = Array.from(value);
  if (chars.length <= feedbackMaxLength) {
    return value;
  }
  return chars.slice(0, feedbackMaxLength).join("");
}

function getCharLength(value: string) {
  return Array.from(value).length;
}

function toMetrics(metrics: ResearchFeedbackMetrics, copy: ResearchMessages): Metric[] {
  return [
    { value: String(metrics.userCount), label: copy.metricLabels.userCount, icon: "people" },
    { value: String(metrics.approvedFeedbackCount), label: copy.metricLabels.approvedFeedbackCount, icon: "comment" },
    { value: String(metrics.coveredRegionCount), label: copy.metricLabels.coveredRegionCount, icon: "location" },
    { value: `${metrics.voluntaryPercent}%`, label: copy.metricLabels.voluntaryPercent, icon: "heart" }
  ];
}

function toFeedbackItem(item: ApprovedResearchFeedback, copy: ResearchMessages): FeedbackItem | null {
  const body = item.feedbackText.trim();
  if (!body) {
    return null;
  }

  return {
    city: item.displayRegion || copy.feedback.anonymousRegion,
    body,
    tag: resolveFeedbackTag(item, copy)
  };
}

function resolveFeedbackTag(item: ApprovedResearchFeedback, copy: ResearchMessages) {
  const primaryType = item.feedbackType.split(",").map((value) => value.trim()).find(Boolean);
  if (primaryType) {
    if (primaryType in copy.feedback.typeLabels) {
      return copy.feedback.typeLabels[primaryType as keyof ResearchMessages["feedback"]["typeLabels"]];
    }

    return primaryType;
  }

  return copy.feedback.ratingLabels[item.rating] ?? copy.feedback.anonymousTag;
}

function resolveSubmitErrorMessage(error: unknown, copy: ResearchMessages) {
  if (error instanceof ApiFetchError) {
    if (error.code === "UNAUTHORIZED") {
      return copy.share.errors.unauthorized;
    }
    if (error.code === "RATE_LIMITED") {
      return copy.share.errors.rateLimited;
    }
    if (error.code === "BAD_REQUEST" || error.code === "VALIDATION_FAILED") {
      return copy.share.errors.badRequest;
    }
  }

  return copy.share.errors.fallback;
}
