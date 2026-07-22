"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiFetchError } from "../../lib/api/http";
import {
  getAdminResearchFeedback,
  listAdminResearchFeedback,
  updateAdminResearchFeedback
} from "../../lib/admin/admin-api";
import type {
  AdminResearchFeedbackListItem,
  AdminResearchFeedbackStatus
} from "../../lib/admin/admin-api";
import { AdminShell } from "./AdminShell";
import { useAdminAuth } from "./useAdminAuth";
import styles from "./AdminPages.module.css";

const statusOptions: Array<{ value: AdminResearchFeedbackStatus; label: string }> = [
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已通过" },
  { value: "rejected", label: "已驳回" }
];

const statusLabels: Record<AdminResearchFeedbackStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已驳回"
};

const ratingLabels: Record<string, string> = {
  very: "很有帮助",
  some: "有一点帮助",
  unsure: "还不确定"
};

const pageSizeOptions = [20, 50] as const;

export function AdminFeedbackPage() {
  const { state, admin, errorMessage: authErrorMessage } = useAdminAuth("/admin/feedback");
  const [status, setStatus] = useState<AdminResearchFeedbackStatus>("pending");
  const [items, setItems] = useState<AdminResearchFeedbackListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(20);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [rowActionId, setRowActionId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const visibleStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const visibleEnd = totalCount === 0 ? 0 : Math.min(totalCount, visibleStart + items.length - 1);

  const loadList = useCallback(async (nextStatus: AdminResearchFeedbackStatus, nextPage: number, nextPageSize: number) => {
    setIsLoadingList(true);
    setErrorMessage("");
    try {
      const response = await listAdminResearchFeedback(nextStatus, nextPage, nextPageSize);
      if (response.items.length === 0 && response.totalCount > 0 && nextPage > 1) {
        setPage(nextPage - 1);
        return;
      }
      setItems(response.items);
      setTotalCount(response.totalCount);
      setHasPrevious(response.hasPrevious);
      setHasNext(response.hasNext);
    } catch (error) {
      setErrorMessage(resolveFeedbackError(error));
      setItems([]);
      setTotalCount(0);
      setHasPrevious(false);
      setHasNext(false);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (state !== "authenticated") {
      return;
    }
    loadList(status, page, pageSize);
  }, [loadList, page, pageSize, state, status]);

  async function approveListItem(item: AdminResearchFeedbackListItem) {
    setRowActionId(item.id);
    setStatusMessage("");
    setErrorMessage("");
    try {
      const detail = await getAdminResearchFeedback(item.id);
      const nextDisplayText = approvedDisplayText(item, detail.feedbackText);
      if (!nextDisplayText) {
        setErrorMessage("该反馈没有可公开展示的文本，无法直接通过。");
        return;
      }
      await updateAdminResearchFeedback(item.id, {
        reviewStatus: "approved",
        displayText: nextDisplayText,
        redactedText: detail.redactedText?.trim() || undefined
      });
      setStatusMessage("已审核通过，前端会展示该条反馈。");
      await loadList(status, page, pageSize);
    } catch (error) {
      setErrorMessage(resolveFeedbackError(error));
    } finally {
      setRowActionId(null);
    }
  }

  async function deleteListItem(item: AdminResearchFeedbackListItem) {
    if (!window.confirm(`确定删除反馈 #${item.id} 吗？删除后不会在前端展示。`)) {
      return;
    }

    setRowActionId(item.id);
    setStatusMessage("");
    setErrorMessage("");
    try {
      await updateAdminResearchFeedback(item.id, {
        reviewStatus: "rejected",
        rejectionReasonCode: "deleted_by_admin"
      });
      setStatusMessage("已删除，该反馈不会在前端展示。");
      await loadList(status, page, pageSize);
    } catch (error) {
      setErrorMessage(resolveFeedbackError(error));
    } finally {
      setRowActionId(null);
    }
  }

  return (
    <AdminShell activeSection="feedback" admin={admin}>
      <section className={styles.noticePanel} aria-labelledby="admin-feedback-title">
        <h1 id="admin-feedback-title">研究反馈审核</h1>
        <p>只处理用户主动提交的 research_feedback。公开展示必须使用审核后的 display_text / redacted_text。</p>
      </section>

      <section className={styles.filterPanel} aria-label="筛选反馈">
        <div className={styles.statusTabs} aria-label="审核状态">
          {statusOptions.map((option) => (
            <button
              className={status === option.value ? styles.statusTabActive : ""}
              key={option.value}
              onClick={() => {
                setStatus(option.value);
                setPage(1);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={styles.filterGrid}>
          <label className={styles.compactField}>
            <span>关键词</span>
            <input className={styles.input} disabled placeholder="MVP 暂不开放全文搜索" />
          </label>
          <label className={styles.compactField}>
            <span>反馈类型</span>
            <input className={styles.input} disabled placeholder="全部类型" />
          </label>
          <label className={styles.compactField}>
            <span>提交时间</span>
            <input className={styles.input} disabled placeholder="不限" />
          </label>
          <div className={styles.filterActions}>
            <button className={styles.button} disabled={isLoadingList || state !== "authenticated"} onClick={() => loadList(status, page, pageSize)} type="button">
              刷新列表
            </button>
            <Link className={`${styles.button} ${styles.secondaryButton}`} href="/admin">
              返回首页
            </Link>
          </div>
        </div>
      </section>

      {state === "loading" ? <p className={styles.muted}>正在加载...</p> : null}
      {state === "error" ? <p className={`${styles.status} ${styles.statusError}`}>{authErrorMessage}</p> : null}
      {errorMessage ? <p className={`${styles.status} ${styles.statusError}`}>{errorMessage}</p> : null}
      {statusMessage ? <p className={`${styles.status} ${styles.statusInfo}`}>{statusMessage}</p> : null}

      {state === "authenticated" ? (
        <section className={styles.tablePanel} aria-label="反馈列表">
          <div className={styles.tableHeader}>
            <strong>{statusLabels[status]}</strong>
            <span>{isLoadingList ? "加载中" : `共 ${totalCount} 条`}</span>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.feedbackTable}>
              <thead>
                <tr>
                  <th>编号</th>
                  <th>反馈预览</th>
                  <th>类型</th>
                  <th>帮助程度</th>
                  <th>状态</th>
                  <th>提交时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className={styles.previewCell}>{item.feedbackPreview || "无文本预览"}</td>
                    <td>{item.feedbackType || "未分类"}</td>
                    <td>{ratingLabels[item.rating] ?? item.rating}</td>
                    <td><span className={styles.badge}>{statusLabels[item.reviewStatus]}</span></td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.approveActionButton}
                          disabled={rowActionId !== null || item.reviewStatus === "approved"}
                          onClick={() => approveListItem(item)}
                          type="button"
                        >
                          {rowActionId === item.id ? "处理中" : "审核通过"}
                        </button>
                        <button
                          className={styles.deleteActionButton}
                          disabled={rowActionId !== null || item.reviewStatus === "rejected"}
                          onClick={() => deleteListItem(item)}
                          type="button"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoadingList && items.length === 0 ? (
                  <tr>
                    <td className={styles.emptyTableCell} colSpan={7}>当前状态下没有反馈。</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className={styles.paginationBar}>
            <label className={styles.pageSizeControl}>
              <span>每页</span>
              <select
                className={styles.select}
                disabled={isLoadingList}
                onChange={(event) => {
                  setPageSize(Number(event.currentTarget.value) as (typeof pageSizeOptions)[number]);
                  setPage(1);
                }}
                value={pageSize}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>{option} 条</option>
                ))}
              </select>
            </label>
            <div className={styles.paginationStatus}>
              <span>第 {page} / {totalPages} 页</span>
              <span>{visibleStart}-{visibleEnd} / {totalCount} 条</span>
            </div>
            <div className={styles.paginationActions}>
              <button className={`${styles.button} ${styles.secondaryButton}`} disabled={isLoadingList || !hasPrevious} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">
                上一页
              </button>
              <button className={`${styles.button} ${styles.secondaryButton}`} disabled={isLoadingList || !hasNext} onClick={() => setPage((current) => current + 1)} type="button">
                下一页
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </AdminShell>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function resolveFeedbackError(error: unknown) {
  if (error instanceof ApiFetchError) {
    if (error.code === "FORBIDDEN") {
      return "当前管理员没有审核权限。";
    }
    if (error.code === "UNAUTHORIZED") {
      return "后台登录已失效，请重新登录。";
    }
    if (error.code === "BAD_REQUEST" || error.code === "VALIDATION_FAILED") {
      return "请求内容无效，请检查审核状态和展示文本。";
    }
    if (error.code === "NOT_FOUND") {
      return "该反馈不存在或已不可用。";
    }
  }
  return "反馈审核请求失败，请稍后重试。";
}

function approvedDisplayText(item: AdminResearchFeedbackListItem, feedbackText: string | null) {
  return item.redactedText?.trim() || item.displayText?.trim() || feedbackText?.trim() || item.feedbackPreview.trim();
}
