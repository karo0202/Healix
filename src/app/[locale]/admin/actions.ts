"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function verifyDoctorFormAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return;
  }

  const doctorId = formData.get("doctorId");
  const locale = formData.get("locale");
  if (typeof doctorId !== "string" || typeof locale !== "string") {
    return;
  }

  await prisma.doctor.update({
    where: { id: doctorId },
    data: { isVerified: true },
  });

  revalidatePath(`/${locale}/admin`);
}
