import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
})

export const eventCreateSchema = z.object({
  eventTypeId: z.string().min(1, "Tipo de evento requerido"),
  severityId: z.string().min(1, "Severidad requerida"),
  statusId: z.string().min(1, "Estatus requerido"),
  siteId: z.string().min(1, "Ubicación requerida"),
  areaId: z.string().min(1, "Área requerida"),
  projectId: z.string().optional(),
  shiftId: z.string().optional(),
  contractorId: z.string().optional(),
  description: z.string().min(10, "Descripción debe tener al menos 10 caracteres"),
  eventDateTime: z.string().min(1, "Fecha y hora del evento requerida"),
  ownerUserId: z.string().min(1, "Responsable requerido"),
  isAnonymous: z.boolean().default(false),
  isConfidential: z.boolean().default(false),
  dueDate: z.string().optional(),
})

export const correctiveActionSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional(),
  ownerUserId: z.string().min(1, "Responsable requerido"),
  dueDate: z.string().min(1, "Fecha compromiso requerida"),
})

export const investigationSchema = z.object({
  method: z.enum(["FIVE_WHYS", "CAUSE_TREE", "OTHER"]),
  summary: z.string().optional(),
  rootCause: z.string().optional(),
  findings: z.string().optional(),
})

export const catalogSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  code: z.string().min(1, "Código requerido").regex(/^[A-Z0-9_-]+$/, "Solo mayúsculas, números, guiones"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

export const userCreateSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  name: z.string().min(1, "Nombre requerido"),
  role: z.enum(["REPORTER", "SUPERVISOR", "HSE", "MANAGER", "ADMIN"]),
})

export type LoginInput = z.infer<typeof loginSchema>
export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type CorrectiveActionInput = z.infer<typeof correctiveActionSchema>
export type InvestigationInput = z.infer<typeof investigationSchema>
export type CatalogInput = z.infer<typeof catalogSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
