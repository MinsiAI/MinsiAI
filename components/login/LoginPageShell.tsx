import { AuthCard } from "./AuthCard";
import { BrandPageChrome } from "../site/BrandPageChrome";

export function LoginPageShell() {
  return (
    <BrandPageChrome
      showNav={false}
      showLogin={false}
      backgroundSrc="/figma-assets/login-pc-bg.png"
      mobileBackgroundSrc="/figma-assets/login-mobile-bg.jpg"
      safetyText="登录只是为了安全进入，Minsi 不会保存你的聊天内容。"
      safetyNoticeClassName="hidden"
      mobileSafetyNoticeClassName="login-mobile-bottom-notice relative z-10 mx-auto flex items-start justify-center text-center text-[var(--minsi-safety-mobile)]"
      desktopContentClassName="login-auth-slot absolute left-1/2 top-[14.3%] z-[var(--z-card)] -translate-x-1/2"
      mobileContentClassName="login-mobile-auth-slot relative z-[var(--z-content)] mx-auto mt-[32px] flex w-full max-w-[398px] justify-center"
    >
      <AuthCard />
    </BrandPageChrome>
  );
}
