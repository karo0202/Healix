import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <AppShell locale={locale}>
      <div className="mx-auto mt-20 max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-slate-500">You do not have permission to view this area.</p>
        <Link href={`/${locale}`} className="mt-4 inline-block rounded-lg bg-teal-700 px-4 py-2 text-white">
          Back to home
        </Link>
      </div>
    </AppShell>
  );
}
