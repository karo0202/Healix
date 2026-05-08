"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const locale = params?.locale ?? "en";
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let msg = "Registration failed.";
      try {
        const data = (await response.json()) as { error?: unknown };
        if (typeof data.error === "string") {
          msg = data.error;
        } else if (data.error && typeof data.error === "object" && "fieldErrors" in data.error) {
          msg = "Check your inputs (password must be at least 8 characters).";
        }
      } catch {
        /* ignore */
      }
      setErrorMessage(msg);
      setState("error");
      return;
    }

    setState("done");
    router.push(`/${locale}/auth/login?registered=1`);
  };

  return (
    <div className="mx-auto mt-20 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="fullName" className="w-full rounded-lg border px-3 py-2 dark:border-slate-700" placeholder="Full name" required />
        <input name="email" type="email" className="w-full rounded-lg border px-3 py-2 dark:border-slate-700" placeholder="Email" required />
        <input
          name="password"
          type="password"
          minLength={8}
          className="w-full rounded-lg border px-3 py-2 dark:border-slate-700"
          placeholder="Password (min 8 characters)"
          required
        />
        <select name="role" className="w-full rounded-lg border px-3 py-2 dark:border-slate-700">
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>
        <select name="locale" className="w-full rounded-lg border px-3 py-2 dark:border-slate-700" defaultValue={locale}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
        <button className="w-full rounded-lg bg-teal-700 px-4 py-2 text-white" disabled={state === "loading"}>
          {state === "loading" ? "Creating..." : "Register"}
        </button>
      </form>
      {state === "error" && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href={`/${locale}/auth/login`} className="text-teal-700 underline dark:text-teal-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
