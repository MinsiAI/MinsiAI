"use client";

import { GlassCard } from "../components/site/GlassCard";
import { HomeVoiceButton } from "../components/home/HomeVoiceButton";
import { SafetyNotice } from "../components/site/SafetyNotice";
import { SiteHeader } from "../components/site/SiteHeader";
import { homeMessages, type HomeMessages } from "../lib/i18n/messages";
import type { MinsiLang } from "../lib/i18n/language";
import { useLanguagePreference } from "../lib/i18n/useLanguagePreference";

const asset = (name: string) => `/figma-assets/${name}`;

const featureIcons = [asset("icon-chat.svg"), asset("icon-shield.svg"), asset("icon-feather.svg")];

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

function FeaturePanel({ copy }: { copy: HomeMessages }) {
  return (
    <GlassCard as="section" className="minsi-glass-feature-panel absolute bottom-[7.35%] left-[19.35%] z-[12] flex h-[15.05%] w-[61.3%] items-center justify-center px-[2.55cqw]">
      <div className="grid w-full grid-cols-[1.08fr_0.052cqw_0.98fr_0.052cqw_1.08fr] items-center gap-[1.18cqw]">
        {copy.features.map((feature, index) => (
          <div className="contents" key={feature.title}>
            <article className="flex items-center gap-[1.05cqw]">
              <div className="flex aspect-square w-[4.92cqw] shrink-0 items-center justify-center rounded-full bg-[var(--minsi-feature-icon-bg)]">
                <img className="h-[2.82cqw] w-[2.82cqw]" src={featureIcons[index]} alt="" draggable={false} />
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
            {index < copy.features.length - 1 ? <div className="h-[5.65cqw] w-px bg-[var(--minsi-feature-divider-soft)]" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function DesktopDecorations({ copy, lang }: { copy: HomeMessages; lang: MinsiLang }) {
  return (
    <>
      <div className="absolute left-[1.15%] top-[9.65%] h-[25.35%] w-[17.1%]">
        <img className="h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(183,128,201,0.12)]" src={asset("sticky-pink.png")} alt="" draggable={false} />
        <p className={lang === "zh" ? "absolute left-[38.2%] top-[31%] rotate-[-3deg] font-kai text-[1.98cqw] leading-none text-[var(--minsi-note-text)]" : "absolute left-[30%] top-[33%] rotate-[-3deg] whitespace-nowrap font-kai text-[1.12cqw] leading-none text-[var(--minsi-note-text)]"}>{copy.notes.encouragement[0]}</p>
        <p className={lang === "zh" ? "absolute left-[39.8%] top-[50%] rotate-[-3deg] font-kai text-[2.03cqw] leading-none text-[var(--minsi-note-text)]" : "absolute left-[38%] top-[50%] rotate-[-3deg] whitespace-nowrap font-kai text-[1.2cqw] leading-none text-[var(--minsi-note-text)]"}>{copy.notes.encouragement[1]}</p>
      </div>

      <div className="absolute left-[1.18%] top-[32.9%] h-[26.15%] w-[18.15%]">
        <img className="h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(183,128,201,0.10)]" src={asset("sticky-purple.png")} alt="" draggable={false} />
        <p className={lang === "zh" ? "absolute left-[39.5%] top-[30%] rotate-[-4.7deg] font-kai text-[1.77cqw] leading-none tracking-[0.035cqw] text-[var(--minsi-note-text)]" : "absolute left-[27%] top-[31%] rotate-[-4.7deg] whitespace-nowrap font-kai text-[1.02cqw] leading-none text-[var(--minsi-note-text)]"}>{copy.notes.patience[0]}</p>
        <p className={lang === "zh" ? "absolute left-[40.4%] top-[48.2%] rotate-[-4.7deg] font-kai text-[1.77cqw] leading-none text-[var(--minsi-note-text)]" : "absolute left-[37%] top-[48.2%] rotate-[-4.7deg] whitespace-nowrap font-kai text-[1.12cqw] leading-none text-[var(--minsi-note-text)]"}>{copy.notes.patience[1]}</p>
      </div>

      <img className="absolute left-[-1.6%] top-[60.09%] h-[40.19%] w-[36.15%] object-contain" src={asset("shadow-large.png")} alt="" draggable={false} />
      <img className="absolute left-[-0.05%] top-[47.22%] h-[51.02%] w-[15.47%] object-contain" src={asset("plant.png")} alt="" draggable={false} />
      <img className="absolute left-[5.94%] top-[64.26%] h-[15.37%] w-[8.49%] object-contain" src={asset("shadow-small.png")} alt="" draggable={false} />
      <img className="absolute left-[2.2%] top-[57.85%] z-[1] h-[29.05%] w-[22.95%] object-contain" src={asset("cloud.png")} alt="" draggable={false} />
      <img className="absolute left-[24.4%] top-[62.25%] z-[1] h-[4.08%] w-[2.3%] object-contain" src={asset("cloud-hand.png")} alt="" draggable={false} />
    </>
  );
}

function HeroText({ copy, lang }: { copy: HomeMessages; lang: MinsiLang }) {
  return (
    <section className="absolute left-1/2 top-[10.5%] z-10 w-[46%] -translate-x-1/2 text-center">
      <div className="desktop-hero-title-row relative mx-auto inline-flex items-baseline justify-center whitespace-nowrap font-normal tracking-[0.035cqw]">
        <span className="desktop-hero-title-text text-minsi-ink">{copy.hero.greeting}</span>
        <span className="desktop-hero-title-text hero-minsi">Minsi</span>
        <img
          className="desktop-hero-title-mark absolute -right-[2.66cqw] top-[0.05cqw] opacity-90"
          src={asset("sparkle.svg")}
          alt=""
          draggable={false}
        />
      </div>
      {lang === "zh" ? (
        <img className="mx-auto mt-[0.88cqw] h-[3.84cqw] w-[34.35cqw] object-contain opacity-95" src={asset("hero-script.png")} alt={copy.hero.script} draggable={false} />
      ) : (
        <p className="mx-auto mt-[0.88cqw] flex h-[3.84cqw] w-[34.35cqw] items-center justify-center font-kai text-[2.2cqw] leading-none tracking-[0.05cqw] text-minsi-primary">{copy.hero.script}</p>
      )}
      <img className="mx-auto mt-[0.14cqw] h-[1.66cqw] w-[34.55cqw] object-fill opacity-82" src={asset("hero-underline.svg")} alt="" draggable={false} />
      <p className="mt-[0.54cqw] text-[1.2cqw] leading-normal tracking-[0.075cqw] text-[var(--minsi-copy)]">{copy.hero.subtitle}</p>
    </section>
  );
}

function ChatBubbles({ copy }: { copy: HomeMessages }) {
  return (
    <>
      <div className="minsi-glass-bubble-top absolute left-[74.1%] top-[32.42%] z-10 flex h-[10.15%] w-[18.1%] flex-col justify-center px-[1.68cqw] py-[1.22cqw]">
        <p className="whitespace-nowrap text-[1.14cqw] leading-[1.46cqw] tracking-[0.075cqw] text-[var(--minsi-bubble-text)]">{copy.chat.user}</p>
        <span className="mt-[0.24cqw] self-end text-[0.95cqw] leading-none text-[var(--minsi-time)]">21:32</span>
      </div>
      <div className="minsi-glass-bubble-bottom absolute left-[71.55%] top-[45.98%] z-10 h-[11.55%] w-[20.72%] px-[1.35cqw] py-[1.42cqw]">
        <img className="absolute left-[1.35cqw] top-[2.34cqw] h-[1.62cqw] w-[3.08cqw]" src={asset("chat-logo.svg")} alt="" draggable={false} />
        <p className="ml-[4.28cqw] text-[1.22cqw] leading-[1.98cqw] tracking-[0.092cqw] text-[var(--minsi-bubble-text)]">
          {copy.chat.replyLines[0]}
          <br />
          {copy.chat.replyLines[1]}
        </p>
        <span className="absolute bottom-[1.55cqw] right-[2.02cqw] text-[0.99cqw] leading-none text-[var(--minsi-time)]">21:32</span>
        <img className="absolute -right-[0.46cqw] -top-[0.9cqw] h-[2cqw] w-[2.22cqw]" src={asset("heart.svg")} alt="" draggable={false} />
      </div>
    </>
  );
}

function VoiceArea({ copy }: { copy: HomeMessages }) {
  return (
    <section className="voice-area absolute left-[33.05%] top-[33.95%] z-10 h-[32.45%] w-[33.6%]" aria-label={copy.voice.areaLabel}>
      <HomeVoiceButton label={copy.voice.buttonLabel} errorText={copy.voice.error} />
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

function PromptNotes({ copy }: { copy: HomeMessages }) {
  return (
    <section className="absolute left-[39.18%] top-[68.68%] z-10 space-y-[0.62cqw] text-[1.08cqw] leading-normal tracking-[0.083cqw] text-[var(--minsi-prompt)]">
      <div className="flex items-center gap-[0.83cqw]">
        <ShieldLine className="h-[1.56cqw] w-[1.56cqw] text-[var(--minsi-prompt)]" />
        <span>{copy.prompt.chooseMode}</span>
      </div>
      <div className="flex items-center gap-[0.83cqw]">
        <LockLine className="h-[1.56cqw] w-[1.56cqw] text-[var(--minsi-prompt)]" />
        <span>{copy.prompt.noSave}</span>
        <img className="h-[1.25cqw] w-[1.25cqw]" src={asset("heart.svg")} alt="" draggable={false} />
      </div>
    </section>
  );
}

function DesktopHome({ copy, lang, onLanguageChange }: { copy: HomeMessages; lang: MinsiLang; onLanguageChange: (lang: MinsiLang) => void }) {
  return (
    <main className="desktop-shell hidden min-h-[100svh] items-center justify-center overflow-hidden lg:flex" lang={lang === "zh" ? "zh-CN" : "en"}>
      <div className="desktop-stage relative z-[1] aspect-video overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover" src={asset("bg-pc.png")} alt="" draggable={false} />
        <div className="desktop-content-layer">
          <SiteHeader variant="desktop" lang={lang} localized onLanguageChange={onLanguageChange} />
          <div className="desktop-main-content">
            <DesktopDecorations copy={copy} lang={lang} />
            <HeroText copy={copy} lang={lang} />
            <ChatBubbles copy={copy} />
            <VoiceArea copy={copy} />
            <PromptNotes copy={copy} />
            <FeaturePanel copy={copy} />
            <SafetyNotice
              variant="desktop"
              text={copy.safety}
              className="absolute bottom-[0.72%] left-1/2 z-10 flex w-[56.5%] -translate-x-1/2 items-center justify-center gap-[0.72cqw] text-center text-[0.98cqw] leading-[1.32cqw] tracking-[0.075cqw] text-[var(--minsi-safety-desktop)]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function MobileHome({ copy, lang, onLanguageChange }: { copy: HomeMessages; lang: MinsiLang; onLanguageChange: (lang: MinsiLang) => void }) {
  return (
    <main className="mobile-shell relative min-h-[100svh] overflow-x-hidden px-4 pb-2 pt-0 sm:px-8 lg:hidden" lang={lang === "zh" ? "zh-CN" : "en"}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mobile-note absolute left-[3px] top-[45px] h-[72px] w-[80px] opacity-80 max-[389px]:hidden">
          <img className="h-full w-full rotate-[-8deg] object-contain drop-shadow-[0_12px_18px_rgba(178,124,156,0.16)]" src={asset("sticky-pink.png")} alt="" draggable={false} />
          <p className={lang === "zh" ? "absolute left-[34%] top-[33%] rotate-[-8deg] font-kai text-[11px] leading-none text-[var(--minsi-note-text)]" : "absolute left-[27%] top-[34%] rotate-[-8deg] whitespace-nowrap font-kai text-[7px] leading-none text-[var(--minsi-note-text)]"}>{copy.notes.encouragement[0]}</p>
          <p className={lang === "zh" ? "absolute left-[35%] top-[50%] rotate-[-8deg] font-kai text-[11px] leading-none text-[var(--minsi-note-text)]" : "absolute left-[35%] top-[51%] rotate-[-8deg] whitespace-nowrap font-kai text-[8px] leading-none text-[var(--minsi-note-text)]"}>{copy.notes.encouragement[1]}</p>
        </div>
        <img className="mobile-window absolute right-[-250px] top-[94px] h-[540px] w-[760px] object-cover object-right-bottom opacity-[0.82]" src={asset("bg-pc.png")} alt="" draggable={false} />
        <div className="mobile-window-fade absolute inset-x-0 top-[282px] h-[390px]" />
        <img className="mobile-cloud absolute left-[-88px] top-[342px] h-[178px] w-[184px] object-contain opacity-95" src={asset("cloud.png")} alt="" draggable={false} />
        <img className="mobile-cloud-hand absolute left-[86px] top-[389px] h-[24px] w-[16px] object-contain opacity-95" src={asset("cloud-hand.png")} alt="" draggable={false} />
      </div>

      <SiteHeader variant="mobile" lang={lang} localized onLanguageChange={onLanguageChange} />

      <section className="mobile-hero relative z-10 mx-auto mt-[var(--mobile-page-header-gap)] max-w-[360px] translate-x-[10px] text-center">
        <div className="mobile-title-row relative inline-flex items-baseline justify-center gap-[9px] whitespace-nowrap font-semibold leading-none tracking-[0.2px]">
          <span className="mobile-title text-[27px] text-minsi-ink">{copy.hero.greeting}</span>
          <span className="mobile-title mobile-title-minsi text-[27px] text-minsi-primary">Minsi</span>
          <img className="mobile-title-heart absolute -right-[24px] -top-[7px] h-[19px] w-[19px]" src={asset("sparkle.svg")} alt="" draggable={false} />
        </div>
        {lang === "zh" ? (
          <img className="mobile-script mx-auto mt-[8px] h-[30px] w-[258px] object-contain opacity-95" src={asset("hero-script.png")} alt={copy.hero.script} draggable={false} />
        ) : (
          <p className="mobile-script mx-auto mt-[8px] flex h-[30px] w-[258px] items-center justify-center font-kai text-[21px] leading-none tracking-[0.4px] text-minsi-primary">{copy.hero.script}</p>
        )}
        <img className="mobile-underline mx-auto mt-[1px] h-[12px] w-[270px] object-fill opacity-85" src={asset("hero-underline.svg")} alt="" draggable={false} />
        <p className="mobile-subtitle mt-[9px] text-[13px] leading-5 tracking-[0.7px] text-[var(--minsi-copy)]">{copy.hero.subtitle}</p>
      </section>

      <section className="mobile-chat relative z-10 mx-auto mt-[12px] h-[130px] max-w-[360px]">
        <div className="mobile-chat-top minsi-mobile-chat-bubble-top absolute right-[22px] top-0 flex h-[50px] w-[178px] items-center px-[18px]">
          <p className="text-[14px] tracking-[0.5px] text-[var(--minsi-bubble-text)]">{copy.chat.user}</p>
          <span className="absolute bottom-[9px] right-[15px] text-[12px] leading-none text-[var(--minsi-time)]">21:32</span>
        </div>
        <div className="mobile-chat-bottom minsi-mobile-chat-bubble-bottom absolute left-[18px] top-[66px] h-[64px] w-[252px] px-[17px] py-[14px]">
          <img className="mobile-chat-logo absolute left-[18px] top-[25px] h-[19px] w-[36px]" src={asset("chat-logo.svg")} alt="" draggable={false} />
          <p className="mobile-chat-reply ml-[60px] text-[16px] leading-[21px] tracking-[0.6px] text-[var(--minsi-bubble-text)]">
            {copy.chat.replyLines[0]}
            <br />
            {copy.chat.replyLines[1]}
          </p>
          <span className="absolute bottom-[13px] right-[22px] text-[12px] leading-none text-[var(--minsi-time)]">21:32</span>
          <img className="absolute -right-[9px] -top-[12px] h-[22px] w-[22px]" src={asset("heart.svg")} alt="" draggable={false} />
        </div>
      </section>

      <section className="mobile-voice-section relative z-10 mt-4 flex flex-col items-center">
        <div className="voice-area mobile-voice-area relative flex h-[126px] w-[126px] items-center justify-center">
          <HomeVoiceButton mobile label={copy.voice.buttonLabel} errorText={copy.voice.error} />
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
          <span className={lang === "zh" ? "col-start-2 col-span-2 row-start-1 whitespace-nowrap max-[360px]:whitespace-normal" : "col-start-2 col-span-2 row-start-1 max-w-[270px] whitespace-normal"}>{copy.prompt.chooseMode}</span>
          <LockLine className="col-start-1 row-start-2 mx-auto h-[17px] w-[17px] shrink-0 text-[var(--minsi-prompt-mobile)]" />
          <span className={lang === "zh" ? "col-start-2 row-start-2 whitespace-nowrap max-[360px]:whitespace-normal" : "col-start-2 row-start-2 max-w-[250px] whitespace-normal"}>{copy.prompt.noSave}</span>
          <img className="col-start-3 row-start-2 h-[13px] w-[13px] shrink-0" src={asset("heart.svg")} alt="" draggable={false} />
        </div>
      </section>

      <section className="mobile-features minsi-mobile-features-surface relative z-10 mx-auto mt-5 flex w-full max-w-[690px] flex-col gap-4">
        {copy.features.map((feature, index) => (
          <GlassCard as="article" className="mobile-feature-card minsi-glass-mobile-feature-card relative z-10 flex w-full items-center gap-4 px-5 py-2" key={feature.title}>
            <div className="mobile-feature-icon flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[var(--minsi-feature-icon-bg)]">
              <img className="mobile-feature-icon-img h-[30px] w-[30px]" src={featureIcons[index]} alt="" draggable={false} />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="mobile-feature-title text-[16px] font-medium leading-[22px] tracking-[0.4px] text-minsi-ink">{feature.title}</h2>
              <p className="mobile-feature-body mt-[4px] text-[13.5px] leading-[20px] tracking-[0.2px] text-[var(--minsi-copy-strong)]">{feature.body}</p>
            </div>
          </GlassCard>
        ))}
      </section>

      <SafetyNotice variant="mobile" text={copy.safety} />

      <div className="relative z-10 mx-auto mt-4 h-[4px] w-[134px] rounded-full bg-black/90" aria-hidden="true" />
    </main>
  );
}

export default function Page() {
  const { lang, changeLanguage } = useLanguagePreference();
  const copy = homeMessages[lang];

  return (
    <>
      <DesktopHome copy={copy} lang={lang} onLanguageChange={changeLanguage} />
      <MobileHome copy={copy} lang={lang} onLanguageChange={changeLanguage} />
    </>
  );
}
