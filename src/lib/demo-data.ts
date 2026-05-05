import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function ensureDemoData() {
  let patient = await prisma.user.findFirst({
    where: { role: "PATIENT" },
    select: { id: true, fullName: true, email: true },
  });

  if (!patient) {
    patient = await prisma.user.create({
      data: {
        fullName: "Demo Patient",
        email: "patient@medireserve.local",
        role: "PATIENT",
        locale: "en",
      },
      select: { id: true, fullName: true, email: true },
    });
  }

  const doctorsCount = await prisma.doctor.count();
  if (doctorsCount === 0) {
    const seedDoctors: Array<{
      fullName: string;
      specialty: string;
      location: string;
      experienceYears: number;
      fees: number;
    }> = [
      { fullName: "Dr. Sarah Khan", specialty: "cardiology", location: "Dubai", experienceYears: 12, fees: 65 },
      { fullName: "Dr. Ahmed Ali", specialty: "dermatology", location: "Riyadh", experienceYears: 9, fees: 50 },
      { fullName: "Dr. Lina Omar", specialty: "pediatrics", location: "Cairo", experienceYears: 15, fees: 70 },
    ];

    const doctorUsers = await Promise.all(
      seedDoctors.map(({ fullName, specialty, location, experienceYears, fees }, index) =>
        prisma.user.create({
          data: {
            fullName,
            email: `doctor${index + 1}@medireserve.local`,
            role: "DOCTOR",
            locale: "en",
            doctorProfile: {
              create: {
                specialty,
                location,
                experienceYears: Number(experienceYears),
                fees: new Prisma.Decimal(Number(fees)),
                bio: `${fullName} is an experienced ${specialty} specialist.`,
                rating: 4.6 + index * 0.1,
                isVerified: true,
                availability: {
                  monday: ["09:00", "10:00", "11:00"],
                  wednesday: ["13:00", "14:00"],
                  friday: ["16:00", "17:00"],
                },
              },
            },
          },
        }),
      ),
    );

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctorUsers[0].id,
        startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 30),
        reason: "General checkup",
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    });
  }

  return { patientId: patient.id };
}
