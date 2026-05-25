import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minsi",
  description: "Minsi homepage recreated from Figma",
  icons: {
    icon: "/figma-assets/logo-mark.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
