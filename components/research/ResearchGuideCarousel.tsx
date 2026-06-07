"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GlassCard } from "../site/GlassCard";
import styles from "./ResearchPage.module.css";

type ResearchIconType = "shield" | "comment" | "refresh" | "people" | "location" | "heart" | "sparkle" | "send" | "lock" | "check";

export interface ResearchGuideCarouselItem {
  title: string;
  body: string;
  icon: ResearchIconType;
}

interface ResearchGuideCarouselProps {
  items: ResearchGuideCarouselItem[];
}

function GuideIcon({ type }: { type: ResearchIconType }) {
  if (type === "comment") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5.4 5.7h13.2v9.1H10l-4.6 3.5V5.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8.3 9.3h7.4M8.3 12h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.5 19 6v5.6c0 4.2-2.8 7.7-7 8.9-4.2-1.2-7-4.7-7-8.9V6l7-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m8.7 12.1 2.1 2.1 4.7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 14 9l5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2 2-5.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ResearchGuideCarousel({ items }: ResearchGuideCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const slide = track.querySelector<HTMLElement>(`[data-research-guide-slide="${index}"]`);

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
      const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-research-guide-slide]"));
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
    <div className={styles.guideCarousel} aria-roledescription="carousel" aria-label="研究计划轮播">
      <div className={styles.guideTrack} ref={trackRef} onScroll={handleScroll}>
        {items.map((item, index) => (
          <GlassCard as="article" className={`${styles.guideCard} ${styles.guideSlide}`} key={item.title} data-research-guide-slide={index} aria-label={item.title}>
            <div className={styles.guideCardHeader}>
              <span>
                <GuideIcon type={item.icon} />
              </span>
              <h3>{item.title}</h3>
            </div>
            <p>{item.body}</p>
          </GlassCard>
        ))}
      </div>
      <div className={styles.guideDots} aria-label="切换研究计划卡片">
        {items.map((item, index) => (
          <button aria-label={`查看${item.title}`} aria-current={activeIndex === index ? "true" : undefined} className={styles.guideDot} key={item.title} onClick={() => scrollToIndex(index)} type="button" />
        ))}
      </div>
    </div>
  );
}
