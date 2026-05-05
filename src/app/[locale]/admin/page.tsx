import { UserRole } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { verifyDoctorFormAction } from "./actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole([UserRole.ADMIN]);
  const [pendingDoctorsCount, monthAppointments, paid, pendingDoctorRows] = await Promise.all([
    prisma.doctor.count({ where: { isVerified: false } }),
    prisma.appointment.count({
      where: {
        startsAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.doctor.findMany({
      where: { isVerified: false },
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "asc" },
      take: 25,
    }),
  ]);

  return (
    <AppShell locale={locale}>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">Doctors Pending Verification</p>
          <p className="mt-2 text-3xl font-semibold">{pendingDoctorsCount}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">Appointments This Month</p>
          <p className="mt-2 text-3xl font-semibold">{monthAppointments}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">Revenue (USD)</p>
          <p className="mt-2 text-3xl font-semibold">${paid._sum.amount?.toString() ?? "0"}</p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Verify doctors</h2>
        <p className="mt-1 text-sm text-slate-500">Only verified doctors appear in patient search and can manage appointments.</p>
        <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
          {pendingDoctorRows.length === 0 && (
            <li className="py-4 text-sm text-slate-500">No pending doctors.</li>
          )}
          {pendingDoctorRows.map((doctor) => (
            <li key={doctor.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{doctor.user.fullName}</p>
                <p className="text-sm text-slate-500">
                  {doctor.specialty} - {doctor.user.email}
                </p>
              </div>
              <form action={verifyDoctorFormAction}>
                <input type="hidden" name="doctorId" value={doctor.id} />
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white"
                >
                  Verify
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
