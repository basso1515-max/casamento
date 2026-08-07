import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  return (
    <main className="inner-page admin-page">
      <AdminDashboard />
    </main>
  );
}
