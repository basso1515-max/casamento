import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="inner-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">área reservada</span>
        <h1>Painel do casal</h1>
        <p>Gere códigos para os convidados e acompanhe as fotos recebidas.</p>
      </section>
      <AdminLoginForm />
    </main>
  );
}
