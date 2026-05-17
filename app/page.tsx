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

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className={compact ? "flex items-center" : "desktop-logo flex items-center"} href="#" aria-label="Minsi 首页">
      <img
        className={compact ? "h-[18px] w-[31px] object-contain" : "h-[2.17cqw] w-[3.73cqw] object-contain"}
        src={asset("logo-mark.png")}
        alt=""
        draggable={false}
      />
      <img
        className={compact ? "ml-[5px] h-[17.5px] w-[78px] object-contain" : "ml-[0.53cqw] h-[2.1cqw] w-[9.33cqw] object-contain"}
        src={asset("logo-text.png")}
        alt="minsi.ai"
        draggable={false}
      />
    </a>
  );
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 12h17M12 3c2.2 2.5 3.4 5.5 3.4 9S14.2 18.5 12 21M12 3c-2.2 2.5-3.4 5.5-3.4 9s1.2 6.5 3.4 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 7 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function MenuIcon() {
  return (
    <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
    <button
      className={
        mobile
          ? "voice-pulse mobile-voice-button relative z-[2] flex h-[126px] w-[126px] flex-col items-center justify-center rounded-full bg-[linear-gradient(180deg,#bda5ff_0%,#927ff6_52%,#7268ed_100%)] text-white"
          : "voice-pulse desktop-voice-button"
      }
      aria-label="开始和 Minsi 聊聊"
    >
      <div className={mobile ? "flex flex-col items-center" : "desktop-voice-button-content"}>
        <img className={mobile ? "mobile-mic h-[41px] w-[41px]" : "h-[5.08cqw] w-[5.08cqw]"} src={asset("icon-mic.svg")} alt="" draggable={false} />
        <span className={mobile ? "mobile-voice-text mt-[8px] text-[11px]" : "mt-[0.92cqw] text-[1.22cqw]"}>开始和 Minsi 聊聊</span>
        <div className={mobile ? "mobile-voice-wave-wrap mt-[6px] scale-[0.92]" : "mt-[1.08cqw]"}>
          <VoiceWave mobile={mobile} />
        </div>
      </div>
    </button>
  );
}

function FeaturePanel() {
  return (
    <section className="absolute bottom-[7.35%] left-[19.35%] z-[12] flex h-[15.05%] w-[61.3%] items-center justify-center rounded-[1.95cqw] bg-white/86 px-[2.55cqw] shadow-[0_12px_30px_rgba(118,103,205,0.11)] backdrop-blur-[30px]">
      <div className="grid w-full grid-cols-[1.08fr_0.052cqw_0.98fr_0.052cqw_1.08fr] items-center gap-[1.18cqw]">
        {features.map((feature, index) => (
          <div className="contents" key={feature.title}>
            <article className="flex items-center gap-[1.05cqw]">
              <div className="flex aspect-square w-[4.92cqw] shrink-0 items-center justify-center rounded-full bg-[#DED4F8]">
                <img className="h-[2.82cqw] w-[2.82cqw]" src={feature.icon} alt="" draggable={false} />
              </div>
              <div>
                <h3 className="text-[1.1cqw] font-medium leading-normal tracking-[0.083cqw] text-minsi-ink">{feature.title}</h3>
                <p className="mt-[0.3cqw] max-w-[15.1cqw] text-[0.94cqw] leading-[1.54cqw] tracking-[0.056cqw] text-[#424D7D]">
                  {feature.desktopLines.map((line) => (
                    <span className="block whitespace-nowrap" key={line}>
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </article>
            {index < features.length - 1 ? <div className="h-[5.65cqw] w-px bg-[#E5E2FF]/70" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function DesktopDecorations() {
  return (
    <>
      <div className="absolute left-[1.15%] top-[9.65%] h-[25.35%] w-[17.1%]">
        <img className="h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(183,128,201,0.12)]" src={asset("sticky-pink.png")} alt="" draggable={false} />
        <p className="absolute left-[38.2%] top-[31%] rotate-[-3deg] font-kai text-[1.98cqw] leading-none text-[#66354c]">你已经</p>
        <p className="absolute left-[39.8%] top-[50%] rotate-[-3deg] font-kai text-[2.03cqw] leading-none text-[#66354c]">很棒了！</p>
      </div>

      <div className="absolute left-[1.18%] top-[32.9%] h-[26.15%] w-[18.15%]">
        <img className="h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(183,128,201,0.10)]" src={asset("sticky-purple.png")} alt="" draggable={false} />
        <p className="absolute left-[39.5%] top-[30%] rotate-[-4.7deg] font-kai text-[1.77cqw] leading-none tracking-[0.035cqw] text-[#66354c]">慢慢来，</p>
        <p className="absolute left-[40.4%] top-[48.2%] rotate-[-4.7deg] font-kai text-[1.77cqw] leading-none text-[#66354c]">没关系的</p>
      </div>

      <img className="absolute left-[-1.6%] top-[60.09%] h-[40.19%] w-[36.15%] object-contain" src={asset("shadow-large.png")} alt="" draggable={false} />
      <img className="absolute left-[-0.05%] top-[47.22%] h-[51.02%] w-[15.47%] object-contain" src={asset("plant.png")} alt="" draggable={false} />
      <img className="absolute left-[5.94%] top-[64.26%] h-[15.37%] w-[8.49%] object-contain" src={asset("shadow-small.png")} alt="" draggable={false} />
      <img className="absolute left-[2.2%] top-[57.85%] z-[1] h-[29.05%] w-[22.95%] object-contain" src={asset("cloud.png")} alt="" draggable={false} />
      <img className="absolute left-[24.4%] top-[62.25%] z-[1] h-[4.08%] w-[2.3%] object-contain" src={asset("cloud-hand.png")} alt="" draggable={false} />
    </>
  );
}

function Header() {
  return (
    <header className="desktop-header">
      <div className="desktop-header-inner">
        <Logo />
        <div className="desktop-header-actions">
          <nav className="desktop-nav">
            <a href="#">关于Minsi</a>
            <span />
            <a href="#">隐私与安全</a>
            <span />
            <a href="#">用户研究</a>
          </nav>
          <div className="desktop-auth-actions">
            <button className="desktop-language">
              <GlobeIcon className="desktop-header-icon" />
              中文
              <ChevronIcon className="desktop-header-icon" />
            </button>
            <button className="desktop-login">登录 / 注册</button>
          </div>
        </div>
      </div>
    </header>
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
      <p className="mt-[0.54cqw] text-[1.2cqw] leading-normal tracking-[0.075cqw] text-[#505A7A]">不评判，不打断。你可以放心说，我会一直在。</p>
    </section>
  );
}

function ChatBubbles() {
  return (
    <>
      <div className="absolute left-[74.1%] top-[32.42%] z-10 h-[9.65%] w-[17.05%] rounded-[1.66cqw] bg-[rgba(255,255,255,0.93)] px-[1.42cqw] py-[1.82cqw] shadow-[0_10px_24px_rgba(112,96,156,0.075),inset_-4px_-4px_8px_rgba(255,255,255,0.72),inset_4px_4px_8px_rgba(255,255,255,0.56)] backdrop-blur-[8px]">
        <p className="whitespace-nowrap text-[1.22cqw] leading-[1.56cqw] tracking-[0.092cqw] text-[#252A44]">我不知道怎么讲。</p>
        <span className="absolute bottom-[1.2cqw] right-[1.18cqw] text-[0.99cqw] leading-none text-[#8A8FA8]">21:32</span>
      </div>
      <div className="absolute left-[71.55%] top-[45.98%] z-10 h-[11.55%] w-[20.72%] rounded-[1.66cqw] bg-[rgba(255,255,255,0.92)] px-[1.35cqw] py-[1.42cqw] shadow-[0_10px_24px_rgba(112,96,156,0.065),inset_-4px_-4px_8px_rgba(255,255,255,0.76),inset_4px_4px_8px_rgba(255,255,255,0.56)] backdrop-blur-[8px]">
        <img className="absolute left-[1.35cqw] top-[2.34cqw] h-[1.62cqw] w-[3.08cqw]" src={asset("chat-logo.svg")} alt="" draggable={false} />
        <p className="ml-[4.28cqw] text-[1.22cqw] leading-[1.98cqw] tracking-[0.092cqw] text-[#252A44]">
          没关系，
          <br />
          我们一点点来。
        </p>
        <span className="absolute bottom-[1.55cqw] right-[2.02cqw] text-[0.99cqw] leading-none text-[#8A8FA8]">21:32</span>
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
    <section className="absolute left-[39.18%] top-[68.68%] z-10 space-y-[0.62cqw] text-[1.08cqw] leading-normal tracking-[0.083cqw] text-[#4D578E]">
      <div className="flex items-center gap-[0.83cqw]">
        <ShieldLine className="h-[1.56cqw] w-[1.56cqw] text-[#4D578E]" />
        <span>点击后可选择语音或文字聊天</span>
      </div>
      <div className="flex items-center gap-[0.83cqw]">
        <LockLine className="h-[1.56cqw] w-[1.56cqw] text-[#4D578E]" />
        <span>所有会话不保存，退出后自动删除</span>
        <img className="h-[1.25cqw] w-[1.25cqw]" src={asset("heart.svg")} alt="" draggable={false} />
      </div>
    </section>
  );
}

function DesktopHome() {
  return (
    <main className="desktop-shell hidden min-h-[100svh] items-center justify-center overflow-hidden bg-[#fbf5f7] lg:flex">
      <div className="desktop-stage relative z-[1] aspect-video overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover" src={asset("bg-pc.png")} alt="" draggable={false} />
        <div className="desktop-content-layer">
          <DesktopDecorations />
          <Header />
          <HeroText />
          <ChatBubbles />
          <VoiceArea />
          <PromptNotes />
          <FeaturePanel />
          <footer className="absolute bottom-[2.45%] left-1/2 z-10 flex w-[56.5%] -translate-x-1/2 items-center justify-center gap-[0.72cqw] text-center text-[0.98cqw] leading-[1.28cqw] tracking-[0.075cqw] text-[#424B78]">
            <ShieldLine className="h-[1.56cqw] w-[1.56cqw] shrink-0 text-minsi-primary" />
            <span>Minsi不保存你的聊天内容，也不是医生或心理治疗师。如遇危险情况，请及时联系可信任的大人或专业帮助。</span>
            <img className="h-[1.25cqw] w-[1.25cqw] shrink-0" src={asset("heart.svg")} alt="" draggable={false} />
          </footer>
        </div>
      </div>
    </main>
  );
}

function MobileHome() {
  return (
    <main className="mobile-shell relative min-h-[100svh] overflow-x-hidden bg-[linear-gradient(180deg,#fbf5f7_0%,#fffaf9_46%,#f2efff_100%)] px-4 pb-2 pt-0 sm:px-8 lg:hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mobile-note absolute left-[3px] top-[45px] h-[72px] w-[80px] opacity-80 max-[389px]:hidden">
          <img className="h-full w-full rotate-[-8deg] object-contain drop-shadow-[0_12px_18px_rgba(178,124,156,0.16)]" src={asset("sticky-pink.png")} alt="" draggable={false} />
          <p className="absolute left-[34%] top-[33%] rotate-[-8deg] font-kai text-[11px] leading-none text-[#66354c]">你已经</p>
          <p className="absolute left-[35%] top-[50%] rotate-[-8deg] font-kai text-[11px] leading-none text-[#66354c]">很棒了！</p>
        </div>
        <img className="mobile-window absolute right-[-250px] top-[94px] h-[540px] w-[760px] object-cover object-right-bottom opacity-[0.82]" src={asset("bg-pc.png")} alt="" draggable={false} />
        <div className="mobile-window-fade absolute inset-x-0 top-[282px] h-[390px] bg-[linear-gradient(90deg,rgba(251,245,247,0.96)_0%,rgba(251,245,247,0.78)_52%,rgba(251,245,247,0.18)_100%)]" />
        <img className="mobile-cloud absolute left-[-88px] top-[342px] h-[178px] w-[184px] object-contain opacity-95" src={asset("cloud.png")} alt="" draggable={false} />
        <img className="mobile-cloud-hand absolute left-[86px] top-[389px] h-[24px] w-[16px] object-contain opacity-95" src={asset("cloud-hand.png")} alt="" draggable={false} />
      </div>

      <header className="mobile-header relative z-10 flex h-[42px] items-center justify-between">
        <Logo compact />
        <div className="mobile-header-actions flex h-[34px] items-center gap-3">
          <button className="mobile-language flex h-[34px] items-center gap-1 rounded-full border border-[#EEE8F0] bg-white/86 px-3 text-[15px] leading-none text-minsi-ink shadow-[0_8px_18px_rgba(128,116,253,0.08)] backdrop-blur-[14px]">
            <GlobeIcon className="h-[18px] w-[18px]" />
            中文
            <ChevronIcon className="h-[18px] w-[18px]" />
          </button>
          <button className="mobile-menu-button flex h-[34px] w-[34px] items-center justify-center text-minsi-ink" aria-label="打开菜单">
            <MenuIcon />
          </button>
        </div>
      </header>

      <section className="mobile-hero relative z-10 mx-auto mt-[11px] max-w-[360px] translate-x-[10px] text-center">
        <div className="mobile-title-row relative inline-flex items-baseline justify-center gap-[9px] whitespace-nowrap font-semibold leading-none tracking-[0.2px]">
          <span className="mobile-title text-[27px] text-minsi-ink">嗨， 我是</span>
          <span className="mobile-title mobile-title-minsi text-[27px] text-minsi-primary">Minsi</span>
          <img className="mobile-title-heart absolute -right-[24px] -top-[7px] h-[19px] w-[19px]" src={asset("sparkle.svg")} alt="" draggable={false} />
        </div>
        <img className="mobile-script mx-auto mt-[8px] h-[30px] w-[258px] object-contain opacity-95" src={asset("hero-script.png")} alt="我在这里，听你说。" draggable={false} />
        <img className="mobile-underline mx-auto mt-[1px] h-[12px] w-[270px] object-fill opacity-85" src={asset("hero-underline.svg")} alt="" draggable={false} />
        <p className="mobile-subtitle mt-[9px] text-[13px] leading-5 tracking-[0.7px] text-[#505A7A]">不评判，不打断。你可以放心说，我会一直在。</p>
      </section>

      <section className="mobile-chat relative z-10 mx-auto mt-[12px] h-[130px] max-w-[360px]">
        <div className="mobile-chat-top absolute right-[22px] top-0 flex h-[50px] w-[178px] items-center rounded-[22px] bg-[#F2ECFB]/95 px-[18px] shadow-[0_8px_22px_rgba(126,96,166,0.1),inset_-3px_-3px_8px_rgba(255,255,255,0.7)] backdrop-blur-[8px]">
          <p className="text-[14px] tracking-[0.5px] text-[#252A44]">我不知道怎么讲。</p>
          <span className="absolute bottom-[9px] right-[15px] text-[12px] leading-none text-[#8A8FA8]">21:32</span>
        </div>
        <div className="mobile-chat-bottom absolute left-[18px] top-[66px] h-[64px] w-[252px] rounded-[23px] bg-white/94 px-[17px] py-[14px] shadow-[0_8px_22px_rgba(126,96,166,0.1),inset_-3px_-3px_8px_rgba(255,255,255,0.72)] backdrop-blur-[8px]">
          <img className="mobile-chat-logo absolute left-[18px] top-[25px] h-[19px] w-[36px]" src={asset("chat-logo.svg")} alt="" draggable={false} />
          <p className="mobile-chat-reply ml-[60px] text-[16px] leading-[21px] tracking-[0.6px] text-[#252A44]">
            没关系，
            <br />
            我们一点点来。
          </p>
          <span className="absolute bottom-[13px] right-[22px] text-[12px] leading-none text-[#8A8FA8]">21:32</span>
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

      <section className="mobile-prompt relative z-10 mx-auto mt-[17px] max-w-[80vw] text-[11px] leading-[18px] tracking-[0.45px] text-[#4F5D93]">
        <div className="mx-auto grid w-fit max-w-full grid-cols-[22px_minmax(0,auto)_14px] items-center gap-x-1.5 gap-y-[8px]">
          <ShieldLine className="col-start-1 row-start-1 mx-auto h-[17px] w-[17px] shrink-0 text-[#4F5D93]" />
          <span className="col-start-2 col-span-2 row-start-1 whitespace-nowrap max-[360px]:whitespace-normal">点击后可选择语音或文字聊天</span>
          <LockLine className="col-start-1 row-start-2 mx-auto h-[17px] w-[17px] shrink-0 text-[#4F5D93]" />
          <span className="col-start-2 row-start-2 whitespace-nowrap max-[360px]:whitespace-normal">所有会话不保存，退出后自动删除</span>
          <img className="col-start-3 row-start-2 h-[13px] w-[13px] shrink-0" src={asset("heart.svg")} alt="" draggable={false} />
        </div>
      </section>

      <section className="mobile-features relative z-10 mx-auto mt-5 flex w-full max-w-[690px] flex-col gap-4 before:pointer-events-none before:absolute before:inset-x-[-14px] before:top-[-8px] before:h-[calc(100%+16px)] before:rounded-[34px] before:bg-[rgba(255,250,248,0.76)] before:shadow-[0_0_42px_rgba(255,250,248,0.46)] before:backdrop-blur-[4px] after:pointer-events-none after:absolute after:inset-x-[-10px] after:top-[-6px] after:h-[140px] after:rounded-full after:bg-[#ded4ff]/20 after:blur-[34px]">
        {features.map((feature) => (
          <article className="mobile-feature-card relative z-10 flex w-full items-center gap-4 rounded-[26px] bg-[linear-gradient(100deg,rgba(255,255,255,0.9)_0%,rgba(255,251,247,0.86)_55%,rgba(229,211,196,0.62)_100%)] px-5 py-2 shadow-[0_12px_30px_rgba(118,103,205,0.1)] backdrop-blur-[30px]" key={feature.title}>
            <div className="mobile-feature-icon flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#DED4F8]">
              <img className="mobile-feature-icon-img h-[30px] w-[30px]" src={feature.icon} alt="" draggable={false} />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="mobile-feature-title text-[16px] font-medium leading-[22px] tracking-[0.4px] text-minsi-ink">{feature.title}</h2>
              <p className="mobile-feature-body mt-[4px] text-[13.5px] leading-[20px] tracking-[0.2px] text-[#424D7D]">{feature.body}</p>
            </div>
          </article>
        ))}
      </section>

      <footer className="mobile-footer relative z-10 mx-auto mt-4 flex w-[88%] max-w-[620px] items-start justify-center gap-1.5 text-center text-[10px] leading-[15px] tracking-[0.2px] text-[#53609A]">
        <ShieldLine className="mt-px h-[12px] w-[12px] shrink-0 text-minsi-primary" />
        <p>
          Minsi不保存你的聊天内容，也不是医生或心理治疗师。如遇危险情况，请及时联系可信任的大人或专业帮助。
          <img className="ml-1 inline h-[11px] w-[11px] align-[-1px]" src={asset("heart.svg")} alt="" draggable={false} />
        </p>
      </footer>

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
