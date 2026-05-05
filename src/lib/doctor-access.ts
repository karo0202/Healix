import type { Doctor } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDoctorByUserId(userId: string) {
  return prisma.doctor.findUnique({ where: { userId } });
}

export async function getVerifiedDoctorForUser(userId: string): Promise<Doctor | null> {
  const doctor = await getDoctorByUserId(userId);
  if (!doctor?.isVerified) {
    return null;
  }
  return doctor;
}
