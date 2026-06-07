import type { Metadata } from "next";
import { AboutMinsiPage } from "../../components/about/AboutMinsiPage";

const title = "关于 Minsi | Minsi.ai";
const description = "温柔、安全、不评判的表达空间，了解 Minsi 的陪伴方式与隐私边界。";

export const metadata: Metadata = {
  metadataBase: new URL("https://minsi.ai"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: "/assets/about/hero-bg.png",
        width: 1440,
        height: 638,
        alt: "Minsi 的温柔陪伴空间"
      }
    ]
  }
};

export default function AboutPage() {
  return <AboutMinsiPage />;
}
