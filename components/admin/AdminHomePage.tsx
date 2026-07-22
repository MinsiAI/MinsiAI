"use client";

import Link from "next/link";
import { AdminShell } from "./AdminShell";
import { useAdminAuth } from "./useAdminAuth";
import styles from "./AdminPages.module.css";

export function AdminHomePage() {
  const { state, admin, errorMessage } = useAdminAuth("/admin");

  return (
    <AdminShell activeSection="home" admin={admin}>
      <section className={styles.noticePanel} aria-labelledby="admin-home-title">
        <h1 id="admin-home-title">后台管理 MVP</h1>
        <p>当前阶段仅开放管理员登录和匿名研究反馈审核。不包含聊天记录、用户画像、AI 分析或数据看板。</p>
      </section>

      <section className={styles.workbenchPanel} aria-label="后台入口">
        <div className={styles.sectionTitleRow}>
          <strong>常用入口</strong>
          <span>只展示阶段 11 已开放能力</span>
        </div>
          {state === "loading" ? <p className={styles.muted}>正在加载...</p> : null}
          {state === "error" ? <p className={`${styles.status} ${styles.statusError}`}>{errorMessage}</p> : null}
          {state === "authenticated" ? (
            <div className={styles.homeGrid}>
              <Link className={styles.entry} href="/admin/feedback">
                <strong>研究反馈审核</strong>
                <span>查看待审核 research_feedback，编辑匿名展示文本，并执行通过或驳回。</span>
              </Link>
              <div className={styles.entry} aria-disabled="true">
                <strong>审计日志</strong>
                <span>本阶段只写入脱敏审计日志，暂不提供查询页面。</span>
              </div>
            </div>
          ) : null}
      </section>
    </AdminShell>
  );
}
