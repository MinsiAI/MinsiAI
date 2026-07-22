import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginPage } from "../../../components/admin/AdminLoginPage";

export const metadata: Metadata = {
  title: "后台登录 | Minsi",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLoginRoute() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPage />
    </Suspense>
  );
}
