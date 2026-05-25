import Image from "next/image";

export type QRProvider = "wechat" | "qq";
export type QRStatus = "idle" | "ready" | "loading" | "expired" | "scanned" | "success" | "error";

interface QRLoginCardProps {
  provider: QRProvider;
  active: boolean;
  status: QRStatus;
  onSelect: (provider: QRProvider) => void;
}

const providerCopy: Record<QRProvider, { title: string; hint: string; accentClass: string; iconSrc: string }> = {
  wechat: {
    title: "微信扫码登录",
    hint: "请使用微信扫一扫",
    accentClass: "text-[var(--minsi-wechat)]",
    iconSrc: "/figma-assets/login-wechat.svg"
  },
  qq: {
    title: "QQ扫码登录",
    hint: "请使用QQ扫一扫",
    accentClass: "text-[var(--minsi-qq)]",
    iconSrc: "/figma-assets/login-qq.svg"
  }
};

function statusText(status: QRStatus) {
  if (status === "loading") return "正在生成二维码";
  if (status === "expired") return "二维码已过期";
  if (status === "scanned") return "已扫码，请确认";
  if (status === "success") return "登录成功";
  if (status === "error") return "刷新失败";
  return null;
}

export function QRLoginCard({ provider, active, status, onSelect }: QRLoginCardProps) {
  const copy = providerCopy[provider];
  const overlay = statusText(status);

  return (
    <button
      type="button"
      onClick={() => onSelect(provider)}
      className={`login-qr-card relative flex h-[256px] w-[243px] flex-col items-center rounded-[21px] border bg-[var(--minsi-white)] px-[43px] py-[15px] text-center transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] ${
        active ? "border-[var(--minsi-primary)] shadow-[var(--shadow-login)]" : "border-[var(--minsi-border)]"
      }`}
      aria-pressed={active}
    >
      <div className={`login-qr-card-title flex items-center justify-center gap-2 text-[14px] leading-7 ${copy.accentClass}`}>
        <Image className={`login-provider-icon login-provider-icon-${provider}`} src={copy.iconSrc} alt="" width={26} height={26} draggable={false} />
        <span>{copy.title}</span>
      </div>

      <div className="login-qr-box relative mt-[10px] flex h-[155px] w-[155px] items-center justify-center bg-[var(--minsi-white)]">
        <Image className="login-qr-image h-[188px] w-[188px] max-w-none object-contain" src="/figma-assets/login-qr.svg" alt="" width={188} height={188} draggable={false} />
        {overlay ? (
          <span className="absolute inset-x-3 top-1/2 flex min-h-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-[var(--minsi-border)] bg-[var(--minsi-card-bg-strong)] px-3 text-[12px] leading-none text-[var(--minsi-copy-strong)] shadow-[var(--shadow-language)] backdrop-blur-[10px]">
            {overlay}
          </span>
        ) : null}
      </div>

      <p className="login-qr-hint mt-[3px] text-[14px] leading-7 text-[var(--minsi-muted)]">{copy.hint}</p>
    </button>
  );
}
