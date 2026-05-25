import { GlassCard } from "../GlassCard";

const privacyItems = [
  {
    label: "不用手机号",
    icon: "shield"
  },
  {
    label: "聊天不保存",
    icon: "lock"
  },
  {
    label: "退出自动清除",
    icon: "spark"
  }
];

function PrivacyIcon({ type, className = "" }: { type: string; className?: string }) {
  if (type === "lock") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4.5v4M12 15.5v4M4.5 12h4M15.5 12h4M7.2 7.2l2.8 2.8M14 14l2.8 2.8M16.8 7.2 14 10M10 14l-2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 19 6v5.5c0 4.25-2.85 7.8-7 8.95-4.15-1.15-7-4.7-7-8.95V6l7-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.7 12.1 2.1 2.1 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoginPrivacyBar() {
  return (
    <GlassCard
      as="aside"
      className="mx-auto mt-4 flex w-full max-w-[560px] flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-[var(--minsi-border-soft)] bg-[color-mix(in_srgb,var(--minsi-lavender)_70%,transparent)] px-5 py-3 text-[13px] font-medium leading-5 text-[var(--minsi-primary)] backdrop-blur-[14px] sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-x-3"
    >
      {privacyItems.map((item, index) => (
        <div className="contents" key={item.label}>
          <div className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap">
            <PrivacyIcon type={item.icon} className="h-[18px] w-[18px] shrink-0" />
            <span>{item.label}</span>
          </div>
          {index < privacyItems.length - 1 ? <span className="hidden h-5 w-px bg-[var(--minsi-border)] sm:block" aria-hidden="true" /> : null}
        </div>
      ))}
    </GlassCard>
  );
}
