import type { UserRole } from "@prisma/client";

type AppointmentWithRelations = {
  id: string;
  patientId: string;
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
  reason: string | null;
  notes: string | null;
  status: string;
  paymentStatus: string;
  googleEventId: string | null;
  videoCallUrl: string | null;
  doctor: {
    id: string;
    userId: string;
    specialty: string;
    location: string;
    fees: { toString(): string };
    rating: number;
    isVerified: boolean;
    user: { fullName: string; avatarUrl: string | null; email: string };
  };
  patient: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
};

export function serializeAppointmentsForRole(
  rows: AppointmentWithRelations[],
  role: UserRole,
): unknown[] {
  return rows.map((a) => {
    const base = {
      id: a.id,
      patientId: a.patientId,
      doctorId: a.doctorId,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      reason: a.reason,
      status: a.status,
      paymentStatus: a.paymentStatus,
      videoCallUrl: a.videoCallUrl,
    };

    if (role === "PATIENT") {
      return {
        ...base,
        doctor: {
          id: a.doctor.id,
          specialty: a.doctor.specialty,
          location: a.doctor.location,
          fees: a.doctor.fees.toString(),
          rating: a.doctor.rating,
          user: {
            fullName: a.doctor.user.fullName,
            avatarUrl: a.doctor.user.avatarUrl,
          },
        },
      };
    }

    if (role === "DOCTOR") {
      return {
        ...base,
        patient: {
          id: a.patient.id,
          fullName: a.patient.fullName,
        },
      };
    }

    return {
      ...base,
      notes: a.notes,
      googleEventId: a.googleEventId,
      doctor: {
        id: a.doctor.id,
        userId: a.doctor.userId,
        specialty: a.doctor.specialty,
        location: a.doctor.location,
        fees: a.doctor.fees.toString(),
        rating: a.doctor.rating,
        isVerified: a.doctor.isVerified,
        user: a.doctor.user,
      },
      patient: a.patient,
    };
  });
}
