"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locale = params?.locale ?? "en";
  const registered = searchParams.get("registered") === "1";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: `/${locale}/dashboard`,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials");
      return;
    }
    router.push(result?.url ?? `/${locale}/dashboard`);
  };

  return (
    <div className="mx-auto mt-20 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-2xl font-semibold">Welcome back</h1>
      {registered && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          Account created. Sign in below.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-teal-700 px-4 py-2 text-white">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{" "}
        <Link href={`/${locale}/auth/register`} className="text-teal-700 underline dark:text-teal-300">
          Register
        </Link>
      </p>
    </div>
  );
}
