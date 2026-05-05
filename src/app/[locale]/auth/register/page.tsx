"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setState(response.ok ? "done" : "error");
  };

  return (
    <div className="mx-auto mt-20 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="fullName" className="w-full rounded-lg border px-3 py-2" placeholder="Full name" required />
        <input name="email" type="email" className="w-full rounded-lg border px-3 py-2" placeholder="Email" required />
        <input name="password" type="password" className="w-full rounded-lg border px-3 py-2" placeholder="Password" required />
        <select name="role" className="w-full rounded-lg border px-3 py-2">
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>
        <select name="locale" className="w-full rounded-lg border px-3 py-2">
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
        <button className="w-full rounded-lg bg-teal-700 px-4 py-2 text-white">
          {state === "loading" ? "Creating..." : "Register"}
        </button>
      </form>
      {state === "done" && <p className="mt-3 text-sm text-emerald-600">Account created successfully.</p>}
      {state === "error" && <p className="mt-3 text-sm text-red-600">Registration failed.</p>}
    </div>
  );
}
