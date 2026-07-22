import type { Metadata } from "next";
import { AdminHomePage } from "../../components/admin/AdminHomePage";

export const metadata: Metadata = {
  title: "后台管理 | Minsi",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminHomeRoute() {
  return <AdminHomePage />;
}
