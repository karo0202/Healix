import { UserRole } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { PatientBooking } from "@/components/patient-booking";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function PatientDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole([UserRole.PATIENT]);
  const [appointments, doctors] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: session.user.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { startsAt: "asc" },
      take: 10,
    }),
    prisma.doctor.findMany({
      where: { isVerified: true },
      include: { user: { select: { fullName: true } } },
      orderBy: { rating: "desc" },
      take: 20,
    }),
  ]);

  const upcoming = appointments.filter((a) => new Date(a.startsAt) > new Date()).length;
  const pending = appointments.filter((a) => a.status === "PENDING").length;

  return (
    <AppShell locale={locale}>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">Upcoming Appointments</p>
          <p className="mt-2 text-3xl font-semibold">{upcoming}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">Pending Confirmations</p>
          <p className="mt-2 text-3xl font-semibold">{pending}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">Doctors Available</p>
          <p className="mt-2 text-3xl font-semibold">{doctors.length}</p>
        </article>
      </section>
      <div className="mt-6">
        <PatientBooking
          doctors={doctors.map((doctor) => ({
            id: doctor.id,
            specialty: doctor.specialty,
            location: doctor.location,
            fees: doctor.fees.toString(),
            rating: doctor.rating,
            user: doctor.user,
          }))}
          appointments={appointments.map((appointment) => ({
            id: appointment.id,
            startsAt: appointment.startsAt.toISOString(),
            status: appointment.status,
            doctor: {
              user: { fullName: appointment.doctor.user.fullName },
              specialty: appointment.doctor.specialty,
            },
          }))}
        />
      </div>
    </AppShell>
  );
}
