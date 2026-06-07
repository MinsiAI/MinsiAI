"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ResearchPage.module.css";

export interface ResearchFeedbackCarouselItem {
  city: string;
  body: string;
  tag: string;
}

interface ResearchFeedbackCarouselProps {
  items: ResearchFeedbackCarouselItem[];
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s6.2-5.4 6.2-11.1A6.2 6.2 0 0 0 5.8 9.9C5.8 15.6 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="9.8" r="2.1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function FeedbackCard({ item, className = "" }: { item: ResearchFeedbackCarouselItem; className?: string }) {
  return (
    <article className={[styles.feedbackCard, className].filter(Boolean).join(" ")}>
      <div className={styles.feedbackMeta}>
        <LocationIcon />
        <span>{item.city}</span>
      </div>
      <blockquote>{item.body}</blockquote>
      <div className={styles.feedbackFooter}>
        <span>{item.tag}</span>
        <button type="button">展开</button>
      </div>
    </article>
  );
}

export function ResearchFeedbackCarousel({ items }: ResearchFeedbackCarouselProps) {
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
    <div className={styles.feedbackCarousel} aria-roledescription="carousel" aria-label="匿名反馈轮播">
      <div className={styles.feedbackTrack} ref={trackRef} onScroll={handleScroll}>
        {items.map((item, index) => (
          <div className={styles.feedbackSlide} key={`${item.city}-${item.tag}`} data-feedback-slide={index}>
            <FeedbackCard item={item} />
          </div>
        ))}
      </div>
      <div className={styles.feedbackDots} aria-label="切换匿名反馈卡片">
        {items.map((item, index) => (
          <button aria-label={`查看${item.city}反馈`} aria-current={activeIndex === index ? "true" : undefined} className={styles.feedbackDot} key={`${item.city}-${item.tag}`} onClick={() => scrollToIndex(index)} type="button" />
        ))}
      </div>
    </div>
  );
}
