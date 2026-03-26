import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { authOptions } from "./auth"
import { hasPermission } from "@/types"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }
  return session
}

export async function requirePermission(permission: string) {
  const session = await requireAuth()
  if (!hasPermission(session.user.role, permission)) {
    redirect("/dashboard")
  }
  return session
}

export async function requireRole(...roles: Role[]) {
  const session = await requireAuth()
  if (!roles.includes(session.user.role)) {
    redirect("/dashboard")
  }
  return session
}
