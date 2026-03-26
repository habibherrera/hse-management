import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: Role
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: Role
  }
}

// Permission definitions per role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  REPORTER: [
    "event:create",
    "event:read:own",
  ],
  SUPERVISOR: [
    "event:create",
    "event:read:own",
    "event:read:area",
    "event:edit:area",
    "event:status:change",
    "action:create",
    "action:close:assigned",
    "dashboard:basic",
    "report:export",
  ],
  HSE: [
    "event:create",
    "event:read:all",
    "event:edit:all",
    "event:status:change",
    "action:create",
    "action:close:all",
    "investigation:create",
    "investigation:approve",
    "dashboard:full",
    "report:export",
  ],
  MANAGER: [
    "event:create",
    "event:read:all",
    "investigation:approve",
    "dashboard:full",
    "report:export",
  ],
  ADMIN: [
    "event:create",
    "event:read:all",
    "event:edit:all",
    "event:status:change",
    "action:create",
    "action:close:all",
    "investigation:create",
    "investigation:approve",
    "dashboard:full",
    "report:export",
    "catalog:manage",
    "user:manage",
  ],
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
