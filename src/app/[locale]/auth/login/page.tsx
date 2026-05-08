import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-20 w-full max-w-md rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm dark:bg-slate-900">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
