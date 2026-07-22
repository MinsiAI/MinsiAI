"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { logoutAdminSession } from "../../lib/admin/admin-api";
import type { CurrentAdmin } from "../../lib/admin/admin-api";
import styles from "./AdminPages.module.css";

type AdminSection = "home" | "feedback";

interface AdminNavItem {
  href: string;
  label: string;
  section?: AdminSection;
  disabled?: boolean;
}

interface AdminShellProps {
  activeSection: AdminSection;
  admin: CurrentAdmin | null;
  children: ReactNode;
}

interface AdminNavSection {
  title: string;
  iconSrc: string;
  items: AdminNavItem[];
}

const navSections: AdminNavSection[] = [
  {
    title: "后台管理",
    iconSrc: "/figma-assets/icon-shield.svg",
    items: [
      { href: "/admin", label: "管理首页", section: "home" as const },
      { href: "/admin/feedback", label: "研究反馈审核", section: "feedback" as const }
    ]
  },
  {
    title: "审计与设置",
    iconSrc: "/figma-assets/login-lock.svg",
    items: [
      { href: "/admin", label: "审计日志", disabled: true },
      { href: "/admin", label: "管理员设置", disabled: true }
    ]
  }
];

export function AdminShell({ activeSection, admin, children }: AdminShellProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutAdminSession();
    } finally {
      router.replace("/admin/login");
    }
  }

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar} aria-label="后台导航">
        <div className={styles.sidebarBrand}>
          <span className={styles.brandMark}>M</span>
          <strong>Minsi Admin</strong>
        </div>
        <nav className={styles.sidebarNav}>
          {navSections.map((section) => (
            <div className={styles.navGroup} key={section.title}>
              <div className={styles.navGroupHeader}>
                <Image className={styles.navSectionIcon} src={section.iconSrc} alt="" width={24} height={24} aria-hidden="true" />
                <span>{section.title}</span>
                <span className={styles.navChevron} aria-hidden="true" />
              </div>
              {section.items.map((item) => {
                const isActive = item.section === activeSection;
                const className = `${styles.navItem} ${isActive ? styles.navItemActive : ""} ${item.disabled ? styles.navItemDisabled : ""}`;
                if (item.disabled) {
                  return (
                    <span className={className} key={item.label} aria-disabled="true">
                      {item.label}
                    </span>
                  );
                }
                return (
                  <Link className={className} href={item.href} key={item.label}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <section className={styles.adminMain}>
        <header className={styles.adminTopbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.menuGlyph} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <Link className={activeSection === "home" ? styles.topbarLinkActive : styles.topbarLink} href="/admin">
              首页
            </Link>
            <Link className={activeSection === "feedback" ? styles.topbarLinkActive : styles.topbarLink} href="/admin/feedback">
              研究反馈
            </Link>
            <span className={styles.topbarLinkMuted}>审计日志</span>
          </div>
          <div className={styles.topbarRight}>
            <span>{admin ? `${admin.emailMasked} · ${admin.role}` : "校验后台登录态"}</span>
            {admin ? (
              <button className={styles.topbarButton} disabled={isLoggingOut} onClick={handleLogout} type="button">
                {isLoggingOut ? "退出中" : "退出"}
              </button>
            ) : null}
          </div>
        </header>
        <div className={styles.subnav} aria-label="后台模块">
          <Link className={activeSection === "home" ? styles.subnavActive : ""} href="/admin">
            管理首页
          </Link>
          <Link className={activeSection === "feedback" ? styles.subnavActive : ""} href="/admin/feedback">
            正在审核反馈
          </Link>
          <span>已通过反馈</span>
          <span>已驳回反馈</span>
          <span>操作审计</span>
        </div>
        <div className={styles.contentCanvas}>{children}</div>
      </section>
    </main>
  );
}
