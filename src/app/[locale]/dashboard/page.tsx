import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

export default async function DashboardRouter({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireSession();

  if (session.user.role === "DOCTOR") {
    redirect(`/${locale}/doctor`);
  }
  if (session.user.role === "ADMIN") {
    redirect(`/${locale}/admin`);
  }
  redirect(`/${locale}/patient`);
}
