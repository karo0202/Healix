"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function AppShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const { setTheme, theme } = useTheme();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-semibold text-teal-700 dark:text-teal-300">
            MediReserve
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/patient`} className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300">
              Patient
            </Link>
            <Link href={`/${locale}/doctor`} className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300">
              Doctor
            </Link>
            <Link href={`/${locale}/admin`} className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300">
              Admin
            </Link>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg border border-slate-300 p-2 dark:border-slate-700"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
