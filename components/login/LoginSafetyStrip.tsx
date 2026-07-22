import Image from "next/image";

interface LoginSafetyStripProps {
  className?: string;
  labels: readonly string[];
}

const safetyItems = [
  { iconSrc: "/figma-assets/login-shield.svg" },
  { iconSrc: "/figma-assets/login-lock.svg" },
  { iconSrc: "/figma-assets/login-clear.svg" }
] as const;

export function LoginSafetyStrip({ className = "", labels }: LoginSafetyStripProps) {
  return (
    <div className={`${className} login-safety-strip grid min-h-[58px] w-full max-w-[565px] grid-cols-3 items-center rounded-[24px] bg-[color-mix(in_srgb,var(--minsi-lavender)_78%,transparent)] px-2 text-[var(--minsi-primary)] lg:flex lg:min-h-[50px] lg:justify-center lg:rounded-full lg:px-[42px]`}>
      {safetyItems.map((item, index) => (
        <div key={labels[index] ?? index} className="login-safety-item flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[12px] leading-none lg:flex-row lg:gap-1 lg:px-0 lg:text-[14px]">
          {index > 0 ? <span className="login-safety-divider mx-[18px] h-[44px] w-px bg-[var(--minsi-line)]" /> : null}
          <Image className="login-safety-icon" src={item.iconSrc} alt="" width={22} height={23} draggable={false} />
          <span className="whitespace-nowrap">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}
