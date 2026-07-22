import type { Metadata } from "next";
import { AdminFeedbackPage } from "../../../components/admin/AdminFeedbackPage";

export const metadata: Metadata = {
  title: "研究反馈审核 | Minsi",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminFeedbackRoute() {
  return <AdminFeedbackPage />;
}
