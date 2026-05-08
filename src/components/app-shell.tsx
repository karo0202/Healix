"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

export function AppShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const { setTheme, theme } = useTheme();
  const { data: session, status } = useSession();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${locale}`} className="text-xl font-semibold text-teal-700 dark:text-teal-300">
            MediReserve
          </Link>
          <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
            {status === "authenticated" ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/${locale}/patient`}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300"
                >
                  Patient
                </Link>
                <Link
                  href={`/${locale}/doctor`}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300"
                >
                  Doctor
                </Link>
                <Link
                  href={`/${locale}/admin`}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300"
                >
                  Admin
                </Link>
                <span className="hidden text-xs text-slate-400 sm:inline">{session.user?.email}</span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="text-sm text-slate-600 underline dark:text-slate-300"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`} className="text-sm text-slate-600 dark:text-slate-300">
                  Login
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm text-white"
                >
                  Register
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg border border-slate-300 p-2 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
