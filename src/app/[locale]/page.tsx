import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <AppShell locale={locale}>
      <section className="grid gap-6 rounded-3xl bg-gradient-to-br from-teal-700 to-cyan-600 p-8 text-white shadow-xl sm:p-12">
        <h1 className="text-3xl font-bold sm:text-5xl">{t("heroTitle")}</h1>
        <p className="max-w-2xl text-base text-teal-50 sm:text-lg">{t("heroSubtitle")}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/auth/login`} className="rounded-xl bg-white px-5 py-2 font-medium text-teal-800">
            Login
          </Link>
          <Link href={`/${locale}/auth/register`} className="rounded-xl border border-white/70 px-5 py-2 font-medium">
            Create account
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
