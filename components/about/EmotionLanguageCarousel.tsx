"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export interface EmotionLanguageCarouselItem {
  title: string;
  body: string;
  image: string;
  width: number;
  height: number;
}

interface EmotionLanguageCarouselProps {
  items: EmotionLanguageCarouselItem[];
}

const aboutAsset = (name: string) => `/assets/about/${name}`;

export function EmotionLanguageCarousel({ items }: EmotionLanguageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const slide = track.querySelector<HTMLElement>(`[data-emotion-slide="${index}"]`);

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
      const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-emotion-slide]"));
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
    <div className="about-emotion-carousel" aria-roledescription="carousel" aria-label="Minsi 的情绪语言">
      <div className="about-emotion-track" ref={trackRef} onScroll={handleScroll}>
        {items.map((state, index) => (
          <article className="about-emotion-item about-emotion-slide" key={state.title} data-emotion-slide={index} aria-label={state.title}>
            <Image src={aboutAsset(state.image)} alt="" width={state.width} height={state.height} sizes="112px" aria-hidden />
            <h3>{state.title}</h3>
            <p>{state.body}</p>
          </article>
        ))}
      </div>
      <div className="about-emotion-dots" aria-label="切换情绪语言卡片">
        {items.map((state, index) => (
          <button
            aria-label={`查看${state.title}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className="about-emotion-dot"
            key={state.title}
            onClick={() => scrollToIndex(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
