import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/en/auth/login");
  }
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    redirect("/en/unauthorized");
  }
  return session;
}
