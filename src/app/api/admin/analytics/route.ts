import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalDoctors, totalAppointments, paidPayments] = await Promise.all([
    prisma.user.count(),
    prisma.doctor.count(),
    prisma.appointment.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalDoctors,
    totalAppointments,
    totalRevenue: paidPayments._sum.amount ?? 0,
  });
}
