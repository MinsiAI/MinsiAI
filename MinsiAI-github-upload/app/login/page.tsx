import type { Metadata } from "next";
import { LoginPageShell } from "../../components/login/LoginPageShell";

export const metadata: Metadata = {
  title: "登录 Minsi.ai | 安全进入你的表达空间",
  description: "使用温柔、安全、不医疗化、不夸大能力的方式进入 Minsi.ai。不用真实姓名，也不用手机号。",
  openGraph: {
    title: "登录 Minsi.ai | 安全进入你的表达空间",
    description: "不用真实姓名，也不用手机号，安全进入 Minsi.ai。",
    images: ["/assets/brand/og-home.png"]
  }
};

export default function LoginPage() {
  return <LoginPageShell />;
}
