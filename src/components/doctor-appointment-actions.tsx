"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  patientName: string;
  startsAt: string;
  status: string;
};

export function DoctorAppointmentActions({ items }: { items: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const updateStatus = async (appointmentId: string, status: "CONFIRMED" | "REJECTED") => {
    setBusyId(appointmentId);
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, status }),
    });
    setBusyId(null);
    if (res.ok) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-slate-500">No appointments yet.</p>}
      {items.map((appointment) => (
        <div
          key={appointment.id}
          className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{appointment.patientName}</p>
            <p className="text-slate-500">{new Date(appointment.startsAt).toLocaleString()}</p>
            <p className="text-slate-600 dark:text-slate-400">{appointment.status}</p>
          </div>
          {appointment.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === appointment.id}
                onClick={() => updateStatus(appointment.id, "CONFIRMED")}
                className="rounded-lg bg-teal-700 px-3 py-1.5 text-white disabled:opacity-50"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busyId === appointment.id}
                onClick={() => updateStatus(appointment.id, "REJECTED")}
                className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-600 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
