import { GlassCard } from "../components/site/GlassCard";
import { MinsiButton } from "../components/site/MinsiButton";
import { SafetyNotice } from "../components/site/SafetyNotice";
import { SiteHeader } from "../components/site/SiteHeader";

const asset = (name: string) => `/figma-assets/${name}`;

const features = [
  {
    title: "语音或文字聊天",
    icon: asset("icon-chat.svg"),
    body: "想说的时候，直接说出来；不方便说话时，也可以慢慢写下来。",
    desktopLines: ["想说的时候，直接说出来;", "不方便说话时，", "也可以慢慢写下来。"]
  },
  {
    title: "不保存会话",
    icon: asset("icon-shield.svg"),
    body: "聊天内容不会长期保留，退出后自动删除。",
    desktopLines: ["聊天内容不会长期保留，", "退出后自动删除。"]
  },
  {
    title: "轻松离开",
    icon: asset("icon-feather.svg"),
    body: "不需要整理记录，也不用担心被翻看，说完就可以安心离开。",
    desktopLines: ["不需要整理记录，也不用", "担心被翻看，说完就可以", "安心离开。"]
  }
];

function ShieldLine({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 19 6v5.5c0 4.25-2.85 7.8-7 8.95-4.15-1.15-7-4.7-7-8.95V6l7-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.7 12.1 2.1 2.1 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockLine({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VoiceWave({ mobile = false }: { mobile?: boolean }) {
  const heights = mobile ? [5, 9, 14, 20, 13, 22, 11, 7] : [9, 15, 23, 33, 20, 29, 18, 26, 14, 9];

  return (
    <div className={`voice-wave flex items-center justify-center ${mobile ? "gap-[2px]" : "gap-[0.4cqw]"}`}>
      {heights.map((height, index) => (
        <span
          key={`${height}-${index}`}
          style={{
            height: mobile ? `${height}px` : `${height / 19.2}cqw`,
            width: mobile ? "3px" : "0.28cqw",
            animationDelay: `${index * 80}ms`
          }}
        />
      ))}
    </div>
  );
}

function VoiceButton({ mobile = false }: { mobile?: boolean }) {
  return (
    <MinsiButton
      className={
        mobile
          ? "voice-pulse mobile-voice-button relative z-[2] flex h-[126px] w-[126px] flex-col items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--minsi-voice-mobile-start)_0%,var(--minsi-voice-mobile-mid)_52%,var(--minsi-voice-mobile-end)_100%)] text-white"
          : "voice-pulse desktop-voice-button"
      }
      aria-label="开始和 Minsi 聊聊"
      type="button"
    >
      <div className={mobile ? "flex flex-col items-center" : "desktop-voice-button-content"}>
        <img className={mobile ? "mobile-mic h-[41px] w-[41px]" : "h-[5.08cqw] w-[5.08cqw]"} src={asset("icon-mic.svg")} alt="" draggable={false} />
        <span className={mobile ? "mobile-voice-text mt-[8px] text-[11px]" : "mt-[0.92cqw] text-[1.22cqw]"}>开始和 Minsi 聊聊</span>
        <div className={mobile ? "mobile-voice-wave-wrap mt-[6px] scale-[0.92]" : "mt-[1.08cqw]"}>
          <VoiceWave mobile={mobile} />
        </div>
      </div>
    </MinsiButton>
  );
}

function FeaturePanel() {
  return (
    <GlassCard as="section" className="minsi-glass-feature-panel absolute bottom-[7.35%] left-[19.35%] z-[12] flex h-[15.05%] w-[61.3%] items-center justify-center px-[2.55cqw]">
      <div className="grid w-full grid-cols-[1.08fr_0.052cqw_0.98fr_0.052cqw_1.08fr] items-center gap-[1.18cqw]">
        {features.map((feature, index) => (
          <div className="contents" key={feature.title}>
            <article className="flex items-center gap-[1.05cqw]">
              <div className="flex aspect-square w-[4.92cqw] shrink-0 items-center justify-center rounded-full bg-[var(--minsi-feature-icon-bg)]">
                <img className="h-[2.82cqw] w-[2.82cqw]" src={feature.icon} alt="" draggable={false} />
              </div>
              <div>
                <h3 className="text-[1.1cqw] font-medium leading-normal tracking-[0.083cqw] text-minsi-ink">{feature.title}</h3>
                <p className="mt-[0.3cqw] max-w-[15.1cqw] text-[0.94cqw] leading-[1.54cqw] tracking-[0.056cqw] text-[var(--minsi-copy-strong)]">
                  {feature.desktopLines.map((line) => (
                    <span className="block whitespace-nowrap" key={line}>
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </article>
            {index < features.length - 1 ? <div className="h-[5.65cqw] w-px bg-[var(--minsi-feature-divider-soft)]" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function DesktopDecorations() {
  return (
    <>
      <div className="absolute left-[1.15%] top-[9.65%] h-[25.35%] w-[17.1%]">
        <img className="h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(183,128,201,0.12)]" src={asset("sticky-pink.png")} alt="" draggable={false} />
        <p className="absolute left-[38.2%] top-[31%] rotate-[-3deg] font-kai text-[1.98cqw] leading-none text-[var(--minsi-note-text)]">你已经</p>
        <p className="absolute left-[39.8%] top-[50%] rotate-[-3deg] font-kai text-[2.03cqw] leading-none text-[var(--minsi-note-text)]">很棒了！</p>
      </div>

      <div className="absolute left-[1.18%] top-[32.9%] h-[26.15%] w-[18.15%]">
        <img className="h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(183,128,201,0.10)]" src={asset("sticky-purple.png")} alt="" draggable={false} />
        <p className="absolute left-[39.5%] top-[30%] rotate-[-4.7deg] font-kai text-[1.77cqw] leading-none tracking-[0.035cqw] text-[var(--minsi-note-text)]">慢慢来，</p>
        <p className="absolute left-[40.4%] top-[48.2%] rotate-[-4.7deg] font-kai text-[1.77cqw] leading-none text-[var(--minsi-note-text)]">没关系的</p>
      </div>

      <img className="absolute left-[-1.6%] top-[60.09%] h-[40.19%] w-[36.15%] object-contain" src={asset("shadow-large.png")} alt="" draggable={false} />
      <img className="absolute left-[-0.05%] top-[47.22%] h-[51.02%] w-[15.47%] object-contain" src={asset("plant.png")} alt="" draggable={false} />
      <img className="absolute left-[5.94%] top-[64.26%] h-[15.37%] w-[8.49%] object-contain" src={asset("shadow-small.png")} alt="" draggable={false} />
      <img className="absolute left-[2.2%] top-[57.85%] z-[1] h-[29.05%] w-[22.95%] object-contain" src={asset("cloud.png")} alt="" draggable={false} />
      <img className="absolute left-[24.4%] top-[62.25%] z-[1] h-[4.08%] w-[2.3%] object-contain" src={asset("cloud-hand.png")} alt="" draggable={false} />
    </>
  );
}

function HeroText() {
  return (
    <section className="absolute left-1/2 top-[10.5%] z-10 w-[46%] -translate-x-1/2 text-center">
      <div className="relative mx-auto inline-flex items-baseline justify-center gap-[1.06cqw] whitespace-nowrap font-normal leading-none tracking-[0.035cqw]">
        <span className="text-[3.58cqw] text-minsi-ink">嗨， 我是</span>
        <span className="hero-minsi text-[3.58cqw]">Minsi</span>
        <img className="absolute -right-[2.66cqw] top-[0.05cqw] h-[2.04cqw] w-[2.04cqw] opacity-90" src={asset("sparkle.svg")} alt="" draggable={false} />
      </div>
      <img className="mx-auto mt-[0.88cqw] h-[3.84cqw] w-[34.35cqw] object-contain opacity-95" src={asset("hero-script.png")} alt="我在这里，听你说。" draggable={false} />
      <img className="mx-auto mt-[0.14cqw] h-[1.66cqw] w-[34.55cqw] object-fill opacity-82" src={asset("hero-underline.svg")} alt="" draggable={false} />
      <p className="mt-[0.54cqw] text-[1.2cqw] leading-normal tracking-[0.075cqw] text-[var(--minsi-copy)]">不评判，不打断。你可以放心说，我会一直在。</p>
    </section>
  );
}

function ChatBubbles() {
  return (
    <>
      <div className="minsi-glass-bubble-top absolute left-[74.1%] top-[32.42%] z-10 h-[9.65%] w-[17.05%] px-[1.42cqw] py-[1.82cqw]">
        <p className="whitespace-nowrap text-[1.22cqw] leading-[1.56cqw] tracking-[0.092cqw] text-[var(--minsi-bubble-text)]">我不知道怎么讲。</p>
        <span className="absolute bottom-[1.2cqw] right-[1.18cqw] text-[0.99cqw] leading-none text-[var(--minsi-time)]">21:32</span>
      </div>
      <div className="minsi-glass-bubble-bottom absolute left-[71.55%] top-[45.98%] z-10 h-[11.55%] w-[20.72%] px-[1.35cqw] py-[1.42cqw]">
        <img className="absolute left-[1.35cqw] top-[2.34cqw] h-[1.62cqw] w-[3.08cqw]" src={asset("chat-logo.svg")} alt="" draggable={false} />
        <p className="ml-[4.28cqw] text-[1.22cqw] leading-[1.98cqw] tracking-[0.092cqw] text-[var(--minsi-bubble-text)]">
          没关系，
          <br />
          我们一点点来。
        </p>
        <span className="absolute bottom-[1.55cqw] right-[2.02cqw] text-[0.99cqw] leading-none text-[var(--minsi-time)]">21:32</span>
        <img className="absolute -right-[0.46cqw] -top-[0.9cqw] h-[2cqw] w-[2.22cqw]" src={asset("heart.svg")} alt="" draggable={false} />
      </div>
    </>
  );
}

function VoiceArea() {
  return (
    <section className="voice-area absolute left-[33.05%] top-[33.95%] z-10 h-[32.45%] w-[33.6%]" aria-label="开始聊天">
      <VoiceButton />
      <div className="voice-orbit" aria-hidden="true">
        <div className="voice-ripple" />
        <div className="voice-ripple" />
        <div className="voice-ripple" />
        <div className="voice-ripple" />
        <div className="voice-ring voice-ring-sm" />
        <div className="voice-ring voice-ring-md" />
        <div className="voice-ring voice-ring-lg" />
        <div className="voice-halo" />
      </div>
    </section>
  );
}

function PromptNotes() {
  return (
    <section className="absolute left-[39.18%] top-[68.68%] z-10 space-y-[0.62cqw] text-[1.08cqw] leading-normal tracking-[0.083cqw] text-[var(--minsi-prompt)]">
      <div className="flex items-center gap-[0.83cqw]">
        <ShieldLine className="h-[1.56cqw] w-[1.56cqw] text-[var(--minsi-prompt)]" />
        <span>点击后可选择语音或文字聊天</span>
      </div>
      <div className="flex items-center gap-[0.83cqw]">
        <LockLine className="h-[1.56cqw] w-[1.56cqw] text-[var(--minsi-prompt)]" />
        <span>所有会话不保存，退出后自动删除</span>
        <img className="h-[1.25cqw] w-[1.25cqw]" src={asset("heart.svg")} alt="" draggable={false} />
      </div>
    </section>
  );
}

function DesktopHome() {
  return (
    <main className="desktop-shell hidden min-h-[100svh] items-center justify-center overflow-hidden lg:flex">
      <div className="desktop-stage relative z-[1] aspect-video overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover" src={asset("bg-pc.png")} alt="" draggable={false} />
        <div className="desktop-content-layer">
          <DesktopDecorations />
          <SiteHeader variant="desktop" />
          <HeroText />
          <ChatBubbles />
          <VoiceArea />
          <PromptNotes />
          <FeaturePanel />
          <SafetyNotice variant="desktop" />
        </div>
      </div>
    </main>
  );
}

function MobileHome() {
  return (
    <main className="mobile-shell relative min-h-[100svh] overflow-x-hidden px-4 pb-2 pt-0 sm:px-8 lg:hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mobile-note absolute left-[3px] top-[45px] h-[72px] w-[80px] opacity-80 max-[389px]:hidden">
          <img className="h-full w-full rotate-[-8deg] object-contain drop-shadow-[0_12px_18px_rgba(178,124,156,0.16)]" src={asset("sticky-pink.png")} alt="" draggable={false} />
          <p className="absolute left-[34%] top-[33%] rotate-[-8deg] font-kai text-[11px] leading-none text-[var(--minsi-note-text)]">你已经</p>
          <p className="absolute left-[35%] top-[50%] rotate-[-8deg] font-kai text-[11px] leading-none text-[var(--minsi-note-text)]">很棒了！</p>
        </div>
        <img className="mobile-window absolute right-[-250px] top-[94px] h-[540px] w-[760px] object-cover object-right-bottom opacity-[0.82]" src={asset("bg-pc.png")} alt="" draggable={false} />
        <div className="mobile-window-fade absolute inset-x-0 top-[282px] h-[390px]" />
        <img className="mobile-cloud absolute left-[-88px] top-[342px] h-[178px] w-[184px] object-contain opacity-95" src={asset("cloud.png")} alt="" draggable={false} />
        <img className="mobile-cloud-hand absolute left-[86px] top-[389px] h-[24px] w-[16px] object-contain opacity-95" src={asset("cloud-hand.png")} alt="" draggable={false} />
      </div>

      <SiteHeader variant="mobile" />

      <section className="mobile-hero relative z-10 mx-auto mt-[11px] max-w-[360px] translate-x-[10px] text-center">
        <div className="mobile-title-row relative inline-flex items-baseline justify-center gap-[9px] whitespace-nowrap font-semibold leading-none tracking-[0.2px]">
          <span className="mobile-title text-[27px] text-minsi-ink">嗨， 我是</span>
          <span className="mobile-title mobile-title-minsi text-[27px] text-minsi-primary">Minsi</span>
          <img className="mobile-title-heart absolute -right-[24px] -top-[7px] h-[19px] w-[19px]" src={asset("sparkle.svg")} alt="" draggable={false} />
        </div>
        <img className="mobile-script mx-auto mt-[8px] h-[30px] w-[258px] object-contain opacity-95" src={asset("hero-script.png")} alt="我在这里，听你说。" draggable={false} />
        <img className="mobile-underline mx-auto mt-[1px] h-[12px] w-[270px] object-fill opacity-85" src={asset("hero-underline.svg")} alt="" draggable={false} />
        <p className="mobile-subtitle mt-[9px] text-[13px] leading-5 tracking-[0.7px] text-[var(--minsi-copy)]">不评判，不打断。你可以放心说，我会一直在。</p>
      </section>

      <section className="mobile-chat relative z-10 mx-auto mt-[12px] h-[130px] max-w-[360px]">
        <div className="mobile-chat-top minsi-mobile-chat-bubble-top absolute right-[22px] top-0 flex h-[50px] w-[178px] items-center px-[18px]">
          <p className="text-[14px] tracking-[0.5px] text-[var(--minsi-bubble-text)]">我不知道怎么讲。</p>
          <span className="absolute bottom-[9px] right-[15px] text-[12px] leading-none text-[var(--minsi-time)]">21:32</span>
        </div>
        <div className="mobile-chat-bottom minsi-mobile-chat-bubble-bottom absolute left-[18px] top-[66px] h-[64px] w-[252px] px-[17px] py-[14px]">
          <img className="mobile-chat-logo absolute left-[18px] top-[25px] h-[19px] w-[36px]" src={asset("chat-logo.svg")} alt="" draggable={false} />
          <p className="mobile-chat-reply ml-[60px] text-[16px] leading-[21px] tracking-[0.6px] text-[var(--minsi-bubble-text)]">
            没关系，
            <br />
            我们一点点来。
          </p>
          <span className="absolute bottom-[13px] right-[22px] text-[12px] leading-none text-[var(--minsi-time)]">21:32</span>
          <img className="absolute -right-[9px] -top-[12px] h-[22px] w-[22px]" src={asset("heart.svg")} alt="" draggable={false} />
        </div>
      </section>

      <section className="mobile-voice-section relative z-10 mt-4 flex flex-col items-center">
        <div className="voice-area mobile-voice-area relative flex h-[126px] w-[126px] items-center justify-center">
          <VoiceButton mobile />
          <div className="voice-orbit mobile-voice-orbit" aria-hidden="true">
            <div className="voice-ripple" />
            <div className="voice-ripple" />
            <div className="voice-ripple" />
            <div className="voice-ripple" />
            <div className="voice-ring voice-ring-sm" />
            <div className="voice-ring voice-ring-md" />
            <div className="voice-ring voice-ring-lg" />
            <div className="voice-halo" />
          </div>
        </div>
      </section>

      <section className="mobile-prompt relative z-10 mx-auto mt-[17px] max-w-[80vw] text-[11px] leading-[18px] tracking-[0.45px] text-[var(--minsi-prompt-mobile)]">
        <div className="mx-auto grid w-fit max-w-full grid-cols-[22px_minmax(0,auto)_14px] items-center gap-x-1.5 gap-y-[8px]">
          <ShieldLine className="col-start-1 row-start-1 mx-auto h-[17px] w-[17px] shrink-0 text-[var(--minsi-prompt-mobile)]" />
          <span className="col-start-2 col-span-2 row-start-1 whitespace-nowrap max-[360px]:whitespace-normal">点击后可选择语音或文字聊天</span>
          <LockLine className="col-start-1 row-start-2 mx-auto h-[17px] w-[17px] shrink-0 text-[var(--minsi-prompt-mobile)]" />
          <span className="col-start-2 row-start-2 whitespace-nowrap max-[360px]:whitespace-normal">所有会话不保存，退出后自动删除</span>
          <img className="col-start-3 row-start-2 h-[13px] w-[13px] shrink-0" src={asset("heart.svg")} alt="" draggable={false} />
        </div>
      </section>

      <section className="mobile-features minsi-mobile-features-surface relative z-10 mx-auto mt-5 flex w-full max-w-[690px] flex-col gap-4">
        {features.map((feature) => (
          <GlassCard as="article" className="mobile-feature-card minsi-glass-mobile-feature-card relative z-10 flex w-full items-center gap-4 px-5 py-2" key={feature.title}>
            <div className="mobile-feature-icon flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[var(--minsi-feature-icon-bg)]">
              <img className="mobile-feature-icon-img h-[30px] w-[30px]" src={feature.icon} alt="" draggable={false} />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="mobile-feature-title text-[16px] font-medium leading-[22px] tracking-[0.4px] text-minsi-ink">{feature.title}</h2>
              <p className="mobile-feature-body mt-[4px] text-[13.5px] leading-[20px] tracking-[0.2px] text-[var(--minsi-copy-strong)]">{feature.body}</p>
            </div>
          </GlassCard>
        ))}
      </section>

      <SafetyNotice variant="mobile" />

      <div className="relative z-10 mx-auto mt-4 h-[4px] w-[134px] rounded-full bg-black/90" aria-hidden="true" />
    </main>
  );
}

export default function Page() {
  return (
    <>
      <DesktopHome />
      <MobileHome />
    </>
  );
}
