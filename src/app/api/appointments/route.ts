import { AppointmentStatus, PaymentStatus, type UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { serializeAppointmentsForRole } from "@/lib/appointment-serializer";
import { getVerifiedDoctorForUser } from "@/lib/doctor-access";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  doctorId: z.string().cuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role as UserRole;

  if (role === "DOCTOR") {
    const verified = await getVerifiedDoctorForUser(session.user.id);
    if (!verified) {
      return NextResponse.json({ error: "Doctor profile is not verified yet." }, { status: 403 });
    }
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId: role === "PATIENT" ? session.user.id : undefined,
      doctor: role === "DOCTOR" ? { userId: session.user.id } : undefined,
    },
    include: {
      doctor: {
        include: {
          user: { select: { fullName: true, avatarUrl: true, email: true } },
        },
      },
      patient: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 100,
  });

  return NextResponse.json({
    appointments: serializeAppointmentsForRole(appointments, role),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const doctorRecord = await prisma.doctor.findUnique({
    where: { id: parsed.data.doctorId },
    select: { id: true, isVerified: true },
  });
  if (!doctorRecord) {
    return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  }
  if (!doctorRecord.isVerified) {
    return NextResponse.json({ error: "This doctor is not accepting bookings yet." }, { status: 403 });
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: parsed.data.doctorId,
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      startsAt: { lt: new Date(parsed.data.endsAt) },
      endsAt: { gt: new Date(parsed.data.startsAt) },
    },
    select: { id: true },
  });

  if (conflict) {
    return NextResponse.json({ error: "Selected timeslot is unavailable." }, { status: 409 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      ...parsed.data,
      patientId: session.user.id,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      status: AppointmentStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    appointmentId: string;
    status?: AppointmentStatus;
    startsAt?: string;
    endsAt?: string;
  };

  if (!body.appointmentId) {
    return NextResponse.json({ error: "appointmentId is required" }, { status: 400 });
  }

  const existing = await prisma.appointment.findUnique({
    where: { id: body.appointmentId },
    include: { doctor: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const isPatientOwner = session.user.role === "PATIENT" && existing.patientId === session.user.id;
  const isDoctorOwner = session.user.role === "DOCTOR" && existing.doctor.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isDoctorOwner) {
    const verifiedDoctor = await getVerifiedDoctorForUser(session.user.id);
    if (!verifiedDoctor) {
      return NextResponse.json({ error: "Verified doctor profile required for this action." }, { status: 403 });
    }
  }

  if (isPatientOwner && body.status && body.status !== AppointmentStatus.CANCELLED) {
    return NextResponse.json({ error: "Patients may only cancel appointments." }, { status: 403 });
  }

  if (isPatientOwner && (body.startsAt || body.endsAt)) {
    const allowedStatuses = new Set<AppointmentStatus>([
      AppointmentStatus.PENDING,
      AppointmentStatus.CONFIRMED,
    ]);
    if (!allowedStatuses.has(existing.status)) {
      return NextResponse.json({ error: "This appointment cannot be rescheduled." }, { status: 403 });
    }
  }

  if (isDoctorOwner && (body.startsAt || body.endsAt)) {
    return NextResponse.json({ error: "Doctors cannot reschedule via this endpoint." }, { status: 403 });
  }

  const appointment = await prisma.appointment.update({
    where: { id: body.appointmentId },
    data: {
      status: body.status,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
    },
  });
  return NextResponse.json({ appointment });
}
