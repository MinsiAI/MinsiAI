"use client";

import { SiteHeader, type SiteHeaderProps } from "./SiteHeader";

export interface SiteHeaderOverlayProps extends Omit<SiteHeaderProps, "variant" | "className"> {
  className?: string;
  stageClassName?: string;
  layerClassName?: string;
}

export function SiteHeaderOverlay({ className = "", stageClassName = "", layerClassName = "", ...headerProps }: SiteHeaderOverlayProps) {
  return (
    <div className={`site-header-overlay desktop-shell hidden min-h-[100svh] items-start justify-center overflow-hidden lg:flex ${className}`.trim()}>
      <div className={`desktop-stage relative z-[1] aspect-video overflow-visible ${stageClassName}`.trim()}>
        <div className={`desktop-content-layer ${layerClassName}`.trim()}>
          <SiteHeader variant="desktop" {...headerProps} />
        </div>
      </div>
    </div>
  );
}
