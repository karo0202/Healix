"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Doctor = {
  id: string;
  specialty: string;
  location: string;
  fees: string;
  rating: number;
  user: { fullName: string };
};

type Appointment = {
  id: string;
  startsAt: string;
  status: string;
  doctor: { user: { fullName: string }; specialty: string };
};

export function PatientBooking({
  doctors,
  appointments,
}: {
  doctors: Doctor[];
  appointments: Appointment[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelBusy, setCancelBusy] = useState<string | null>(null);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        const q = search.toLowerCase();
        return (
          doctor.user.fullName.toLowerCase().includes(q) ||
          doctor.specialty.toLowerCase().includes(q) ||
          doctor.location.toLowerCase().includes(q)
        );
      }),
    [doctors, search],
  );

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startsAt || !doctorId) return;
    setStatus("loading");
    setErrorMessage("");

    const start = new Date(startsAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        reason,
      }),
    });

    if (!response.ok) {
      let msg = "Could not book this slot.";
      try {
        const data = (await response.json()) as { error?: string };
        if (typeof data.error === "string") msg = data.error;
      } catch {
        /* ignore */
      }
      setErrorMessage(msg);
      setStatus("error");
      return;
    }
    setStatus("done");
    router.refresh();
  };

  const cancelAppointment = async (appointmentId: string) => {
    setCancelBusy(appointmentId);
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, status: "CANCELLED" }),
    });
    setCancelBusy(null);
    router.refresh();
  };

  if (doctors.length === 0) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm dark:border-amber-900 dark:bg-amber-950/30">
        <p className="font-medium text-amber-900 dark:text-amber-100">No verified doctors yet</p>
        <p className="mt-2 text-amber-800 dark:text-amber-200">
          Ask an admin to verify doctor profiles, or run <code className="rounded bg-white/50 px-1 dark:bg-black/30">npm run db:seed</code>{" "}
          locally after migrations so demo doctors appear.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 lg:col-span-2">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Find doctors</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specialty or location"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-56 dark:border-slate-700"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredDoctors.map((doctor) => (
            <article
              key={doctor.id}
              className={`rounded-xl border p-4 transition-colors dark:border-slate-800 ${
                doctorId === doctor.id ? "border-teal-600 ring-2 ring-teal-500/30" : "border-slate-200"
              }`}
            >
              <p className="font-semibold">{doctor.user.fullName}</p>
              <p className="text-sm text-slate-500">
                {doctor.specialty} · {doctor.location}
              </p>
              <p className="mt-1 text-sm">Rating: {doctor.rating.toFixed(1)}</p>
              <p className="text-sm">Fee: ${doctor.fees}</p>
              <button
                type="button"
                onClick={() => setDoctorId(doctor.id)}
                className="mt-3 rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
              >
                {doctorId === doctor.id ? "Selected" : "Select"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Book appointment</h2>
        <form onSubmit={submitBooking} className="mt-4 space-y-3">
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700"
            required
          />
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for visit"
            className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700"
          />
          <button className="w-full rounded-lg bg-teal-700 px-4 py-2 text-white" disabled={status === "loading"}>
            {status === "loading" ? "Booking..." : "Book now"}
          </button>
          {status === "done" && <p className="text-sm text-emerald-600">Appointment created.</p>}
          {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>

        <h3 className="mt-6 text-lg font-semibold">Your appointments</h3>
        <div className="mt-2 space-y-2">
          {appointments.length === 0 && <p className="text-sm text-slate-500">No appointments yet.</p>}
          {appointments.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <p className="font-medium">{item.doctor.user.fullName}</p>
              <p className="text-slate-500">{new Date(item.startsAt).toLocaleString()}</p>
              <p className="text-slate-500">{item.status}</p>
              {(item.status === "PENDING" || item.status === "CONFIRMED") && (
                <button
                  type="button"
                  disabled={cancelBusy === item.id}
                  onClick={() => cancelAppointment(item.id)}
                  className="mt-2 text-xs text-red-600 underline disabled:opacity-50"
                >
                  {cancelBusy === item.id ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
