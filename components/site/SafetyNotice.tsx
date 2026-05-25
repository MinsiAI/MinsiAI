const asset = (name: string) => `/figma-assets/${name}`;

export interface SafetyNoticeProps {
  variant?: "desktop" | "mobile";
  className?: string;
  text?: string;
}

function ShieldLine({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 19 6v5.5c0 4.25-2.85 7.8-7 8.95-4.15-1.15-7-4.7-7-8.95V6l7-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.7 12.1 2.1 2.1 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const defaultText = "Minsi不保存你的聊天内容，也不是医生或心理治疗师。如遇危险情况，请及时联系可信任的大人或专业帮助。";

export function SafetyNotice({ variant = "desktop", className, text = defaultText }: SafetyNoticeProps) {
  if (variant === "mobile") {
    return (
      <footer className={className ?? "mobile-footer relative z-10 mx-auto mt-4 flex w-[88%] max-w-[620px] items-start justify-center gap-1.5 text-center text-[10px] leading-[15px] tracking-[0.2px] text-[var(--minsi-safety-mobile)]"}>
        <ShieldLine className="mt-px h-[12px] w-[12px] shrink-0 text-minsi-primary" />
        <p>
          {text}
          <img className="ml-1 inline h-[11px] w-[11px] align-[-1px]" src={asset("heart.svg")} alt="" draggable={false} />
        </p>
      </footer>
    );
  }

  return (
    <footer className={className ?? "absolute bottom-[2.45%] left-1/2 z-10 flex w-[56.5%] -translate-x-1/2 items-center justify-center gap-[0.72cqw] text-center text-[0.98cqw] leading-[1.28cqw] tracking-[0.075cqw] text-[var(--minsi-safety-desktop)]"}>
      <ShieldLine className="h-[1.56cqw] w-[1.56cqw] shrink-0 text-minsi-primary" />
      <span>{text}</span>
      <img className="h-[1.25cqw] w-[1.25cqw] shrink-0" src={asset("heart.svg")} alt="" draggable={false} />
    </footer>
  );
}
