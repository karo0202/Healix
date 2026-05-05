import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get("specialty");
  const location = searchParams.get("location");
  const minRating = Number(searchParams.get("rating") ?? 0);

  const doctors = await prisma.doctor.findMany({
    where: {
      isVerified: isAdmin ? undefined : true,
      specialty: specialty ? { contains: specialty, mode: "insensitive" } : undefined,
      location: location ? { contains: location, mode: "insensitive" } : undefined,
      rating: { gte: minRating },
    },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  const payload = isAdmin
    ? doctors.map((d) => ({
        id: d.id,
        userId: d.userId,
        specialty: d.specialty,
        location: d.location,
        experienceYears: d.experienceYears,
        fees: d.fees.toString(),
        rating: d.rating,
        bio: d.bio,
        isVerified: d.isVerified,
        consultationType: d.consultationType,
        availability: d.availability,
        user: {
          id: d.user.id,
          fullName: d.user.fullName,
          avatarUrl: d.user.avatarUrl,
          email: d.user.email,
        },
      }))
    : doctors.map((d) => ({
        id: d.id,
        specialty: d.specialty,
        location: d.location,
        experienceYears: d.experienceYears,
        fees: d.fees.toString(),
        rating: d.rating,
        bio: d.bio,
        consultationType: d.consultationType,
        user: {
          fullName: d.user.fullName,
          avatarUrl: d.user.avatarUrl,
        },
      }));

  return NextResponse.json({ doctors: payload });
}
