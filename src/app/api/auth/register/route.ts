import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).default(UserRole.PATIENT),
  locale: z.enum(["en", "ar"]).default("en"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (exists) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      ...parsed.data,
      passwordHash,
      doctorProfile:
        parsed.data.role === UserRole.DOCTOR
          ? {
              create: {
                specialty: "general medicine",
                location: "Not set",
                experienceYears: 1,
                fees: 0,
                bio: "Complete your profile from the doctor dashboard.",
                availability: {},
              },
            }
          : undefined,
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
