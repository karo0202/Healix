import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isArabic = locale === "ar";

  return (
    <NextIntlClientProvider messages={messages}>
      <main dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {children}
      </main>
    </NextIntlClientProvider>
  );
}
