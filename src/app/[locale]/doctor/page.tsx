import { UserRole } from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DoctorAppointmentActions } from "@/components/doctor-appointment-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function DoctorDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole([UserRole.DOCTOR]);
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      appointments: {
        include: { patient: true },
        orderBy: { startsAt: "asc" },
        take: 10,
      },
    },
  });

  if (!doctor) {
    return (
      <AppShell locale={locale}>
        <p className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">No doctor profile found.</p>
      </AppShell>
    );
  }

  if (!doctor.isVerified) {
    return (
      <AppShell locale={locale}>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
          <h1 className="text-xl font-semibold text-amber-900 dark:text-amber-100">Profile pending verification</h1>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            Your practice profile is under review. You cannot view bookings or confirm appointments until an administrator
            verifies your account.
          </p>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Specialty: {doctor.specialty} - {doctor.location}
          </p>
          <Link
            href={`/${locale}`}
            className="mt-6 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm text-white"
          >
            Back to home
          </Link>
        </section>
      </AppShell>
    );
  }

  const todayCount = doctor.appointments.filter(
    (item) => item.startsAt.toDateString() === new Date().toDateString(),
  ).length;

  return (
    <AppShell locale={locale}>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Today&apos;s bookings</h2>
          <p className="mt-2 text-3xl font-semibold">{todayCount}</p>
          <p className="mt-2 text-sm text-slate-500">Use the list below to accept or reject pending bookings.</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Availability slots</h2>
          <p className="mt-2 text-sm text-slate-500">{JSON.stringify(doctor.availability)}</p>
        </article>
      </section>
      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold">Upcoming patients</h3>
        <DoctorAppointmentActions
          items={doctor.appointments.map((a) => ({
            id: a.id,
            patientName: a.patient.fullName,
            startsAt: a.startsAt.toISOString(),
            status: a.status,
          }))}
        />
      </section>
    </AppShell>
  );
}
