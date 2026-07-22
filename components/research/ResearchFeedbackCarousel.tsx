"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ResearchPage.module.css";

export interface ResearchFeedbackCarouselItem {
  city: string;
  body: string;
  tag: string;
}

interface ResearchFeedbackCarouselProps {
  items: readonly ResearchFeedbackCarouselItem[];
  ariaLabel: string;
  dotsLabel: string;
  viewPrefix: string;
  viewSuffix: string;
  expandText: string;
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s6.2-5.4 6.2-11.1A6.2 6.2 0 0 0 5.8 9.9C5.8 15.6 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="9.8" r="2.1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FeedbackCard({ item, className = "", expandText }: { item: ResearchFeedbackCarouselItem; className?: string; expandText: string }) {
  return (
    <article className={[styles.feedbackCard, className].filter(Boolean).join(" ")}>
      <div className={styles.feedbackMeta}>
        <LocationIcon />
        <span>{item.city}</span>
      </div>
      <blockquote>{item.body}</blockquote>
      <div className={styles.feedbackFooter}>
        <span>{item.tag}</span>
        <button type="button">{expandText}</button>
      </div>
    </article>
  );
}

export function ResearchFeedbackCarousel({ items, ariaLabel, dotsLabel, viewPrefix, viewSuffix, expandText }: ResearchFeedbackCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const slide = track.querySelector<HTMLElement>(`[data-feedback-slide="${index}"]`);

    if (!slide) {
      return;
    }

    activeIndexRef.current = index;
    setActiveIndex(index);

    const targetLeft = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    const maxLeft = track.scrollWidth - track.clientWidth;

    track.scrollTo({
      behavior,
      left: Math.max(0, Math.min(targetLeft, maxLeft))
    });
  }, []);

  const handleScroll = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-feedback-slide]"));
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let nextIndex = activeIndexRef.current;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - trackCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextIndex = index;
        }
      });

      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    });
  }, []);

  useEffect(() => {
    if (items.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const isLastSlide = activeIndexRef.current === items.length - 1;
      const nextIndex = isLastSlide ? 0 : activeIndexRef.current + 1;
      scrollToIndex(nextIndex, isLastSlide ? "auto" : "smooth");
    }, 3000);

    return () => window.clearInterval(timer);
  }, [items.length, scrollToIndex]);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.feedbackCarousel} aria-roledescription="carousel" aria-label={ariaLabel}>
      <div className={styles.feedbackTrack} ref={trackRef} onScroll={handleScroll}>
        {items.map((item, index) => (
          <div className={styles.feedbackSlide} key={`${item.city}-${item.tag}-${index}`} data-feedback-slide={index}>
            <FeedbackCard item={item} expandText={expandText} />
          </div>
        ))}
      </div>
      <div className={styles.feedbackDots} aria-label={dotsLabel}>
        {items.map((item, index) => (
          <button aria-label={`${viewPrefix}${item.city}${viewSuffix}`} aria-current={activeIndex === index ? "true" : undefined} className={styles.feedbackDot} key={`${item.city}-${item.tag}-${index}`} onClick={() => scrollToIndex(index)} type="button" />
        ))}
      </div>
    </div>
  );
}
