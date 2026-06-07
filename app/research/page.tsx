import type { Metadata } from "next";
import { UserResearchPage } from "../../components/research/ResearchPage";

const title = "匿名心声 | Minsi.ai";
const description = "查看 Minsi 的匿名心声。每条反馈都经过隐私处理，参与是自愿的，聊天内容不保存。";

export const metadata: Metadata = {
  metadataBase: new URL("https://minsi.ai"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: "/assets/research/hero-cloud-logo-balanced.png",
        width: 1748,
        height: 861,
        alt: "Minsi 匿名心声页面"
      }
    ]
  }
};

export default function ResearchPage() {
  return <UserResearchPage />;
}
