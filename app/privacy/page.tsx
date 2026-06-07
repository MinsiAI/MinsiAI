import type { Metadata } from "next";
import { PrivacySafetyPage } from "../../components/privacy/PrivacySafetyPage";

const title = "隐私与安全 | Minsi.ai";
const description = "了解 Minsi 的隐私承诺与安全边界。聊天内容不保存，退出后自动清除，Minsi 不是医生或心理治疗师。";

export const metadata: Metadata = {
  metadataBase: new URL("https://minsi.ai"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: "/assets/privacy/hero-bg.png",
        width: 1440,
        height: 616,
        alt: "Minsi 隐私与安全页面"
      }
    ]
  }
};

export default function PrivacyPage() {
  return <PrivacySafetyPage />;
}
