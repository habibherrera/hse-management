import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Event Types
  const eventTypes = await Promise.all([
    prisma.eventType.upsert({
      where: { code: "INCIDENTE" },
      update: {},
      create: { name: "Incidente", code: "INCIDENTE", sortOrder: 1 },
    }),
    prisma.eventType.upsert({
      where: { code: "ACCIDENTE" },
      update: {},
      create: { name: "Accidente", code: "ACCIDENTE", sortOrder: 2 },
    }),
    prisma.eventType.upsert({
      where: { code: "CUASI_ACCIDENTE" },
      update: {},
      create: { name: "Cuasi-accidente", code: "CUASI_ACCIDENTE", sortOrder: 3 },
    }),
    prisma.eventType.upsert({
      where: { code: "CONDICION_INSEGURA" },
      update: {},
      create: { name: "Condición insegura", code: "CONDICION_INSEGURA", sortOrder: 4 },
    }),
    prisma.eventType.upsert({
      where: { code: "ACTO_INSEGURO" },
      update: {},
      create: { name: "Acto inseguro", code: "ACTO_INSEGURO", sortOrder: 5 },
    }),
  ])

  // Severities
  const severities = await Promise.all([
    prisma.severity.upsert({
      where: { code: "BAJA" },
      update: {},
      create: { name: "Baja", code: "BAJA", color: "#22C55E", sortOrder: 1 },
    }),
    prisma.severity.upsert({
      where: { code: "MEDIA" },
      update: {},
      create: { name: "Media", code: "MEDIA", color: "#EAB308", sortOrder: 2 },
    }),
    prisma.severity.upsert({
      where: { code: "ALTA" },
      update: {},
      create: { name: "Alta", code: "ALTA", color: "#F97316", sortOrder: 3 },
    }),
    prisma.severity.upsert({
      where: { code: "CRITICA" },
      update: {},
      create: { name: "Crítica", code: "CRITICA", color: "#EF4444", sortOrder: 4 },
    }),
  ])

  // Event Statuses
  const statuses = await Promise.all([
    prisma.eventStatus.upsert({
      where: { code: "ABIERTO" },
      update: {},
      create: { name: "Abierto", code: "ABIERTO", isClosed: false, sortOrder: 1 },
    }),
    prisma.eventStatus.upsert({
      where: { code: "EN_SEGUIMIENTO" },
      update: {},
      create: { name: "En seguimiento", code: "EN_SEGUIMIENTO", isClosed: false, sortOrder: 2 },
    }),
    prisma.eventStatus.upsert({
      where: { code: "PENDIENTE_CIERRE" },
      update: {},
      create: { name: "Pendiente de cierre", code: "PENDIENTE_CIERRE", isClosed: false, sortOrder: 3 },
    }),
    prisma.eventStatus.upsert({
      where: { code: "CERRADO" },
      update: {},
      create: { name: "Cerrado", code: "CERRADO", isClosed: true, sortOrder: 4 },
    }),
  ])

  // Sites
  await Promise.all([
    prisma.site.upsert({
      where: { code: "PLANTA_NORTE" },
      update: {},
      create: { name: "Planta Norte", code: "PLANTA_NORTE", sortOrder: 1 },
    }),
    prisma.site.upsert({
      where: { code: "PLANTA_SUR" },
      update: {},
      create: { name: "Planta Sur", code: "PLANTA_SUR", sortOrder: 2 },
    }),
    prisma.site.upsert({
      where: { code: "OFICINAS_CENTRALES" },
      update: {},
      create: { name: "Oficinas Centrales", code: "OFICINAS_CENTRALES", sortOrder: 3 },
    }),
  ])

  // Areas
  await Promise.all([
    prisma.area.upsert({
      where: { code: "PRODUCCION" },
      update: {},
      create: { name: "Producción", code: "PRODUCCION", sortOrder: 1 },
    }),
    prisma.area.upsert({
      where: { code: "MANTENIMIENTO" },
      update: {},
      create: { name: "Mantenimiento", code: "MANTENIMIENTO", sortOrder: 2 },
    }),
    prisma.area.upsert({
      where: { code: "LOGISTICA" },
      update: {},
      create: { name: "Logística", code: "LOGISTICA", sortOrder: 3 },
    }),
    prisma.area.upsert({
      where: { code: "ALMACEN" },
      update: {},
      create: { name: "Almacén", code: "ALMACEN", sortOrder: 4 },
    }),
  ])

  // Projects
  await Promise.all([
    prisma.project.upsert({
      where: { code: "PROYECTO_A" },
      update: {},
      create: { name: "Proyecto A", code: "PROYECTO_A", sortOrder: 1 },
    }),
    prisma.project.upsert({
      where: { code: "PROYECTO_B" },
      update: {},
      create: { name: "Proyecto B", code: "PROYECTO_B", sortOrder: 2 },
    }),
  ])

  // Shifts
  await Promise.all([
    prisma.shift.upsert({
      where: { code: "MATUTINO" },
      update: {},
      create: { name: "Matutino", code: "MATUTINO", sortOrder: 1 },
    }),
    prisma.shift.upsert({
      where: { code: "VESPERTINO" },
      update: {},
      create: { name: "Vespertino", code: "VESPERTINO", sortOrder: 2 },
    }),
    prisma.shift.upsert({
      where: { code: "NOCTURNO" },
      update: {},
      create: { name: "Nocturno", code: "NOCTURNO", sortOrder: 3 },
    }),
  ])

  // Contractors
  await Promise.all([
    prisma.contractor.upsert({
      where: { code: "CONTRATISTA_1" },
      update: {},
      create: { name: "Contratista 1", code: "CONTRATISTA_1", sortOrder: 1 },
    }),
    prisma.contractor.upsert({
      where: { code: "CONTRATISTA_2" },
      update: {},
      create: { name: "Contratista 2", code: "CONTRATISTA_2", sortOrder: 2 },
    }),
  ])

  // SLA Rules
  await prisma.slaRule.upsert({
    where: { id: "sla-critica" },
    update: {},
    create: {
      id: "sla-critica",
      severityId: severities[3].id, // CRITICA
      maxDaysToClose: 3,
      reminderDays: [1, 2],
      escalationDays: 2,
    },
  })
  await prisma.slaRule.upsert({
    where: { id: "sla-alta" },
    update: {},
    create: {
      id: "sla-alta",
      severityId: severities[2].id, // ALTA
      maxDaysToClose: 7,
      reminderDays: [3, 5],
      escalationDays: 5,
    },
  })
  await prisma.slaRule.upsert({
    where: { id: "sla-media" },
    update: {},
    create: {
      id: "sla-media",
      severityId: severities[1].id, // MEDIA
      maxDaysToClose: 15,
      reminderDays: [7, 12],
      escalationDays: 12,
    },
  })
  await prisma.slaRule.upsert({
    where: { id: "sla-baja" },
    update: {},
    create: {
      id: "sla-baja",
      severityId: severities[0].id, // BAJA
      maxDaysToClose: 30,
      reminderDays: [15, 25],
      escalationDays: 25,
    },
  })

  // Event sequence
  await prisma.eventSequence.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", year: new Date().getFullYear(), counter: 0 },
  })

  // Users
  const passwordHash = await hash("admin123", 12)

  await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      email: "admin@empresa.com",
      password: passwordHash,
      name: "Administrador",
      role: "ADMIN",
    },
  })

  await prisma.user.upsert({
    where: { email: "hse@empresa.com" },
    update: {},
    create: {
      email: "hse@empresa.com",
      password: passwordHash,
      name: "Coordinador HSE",
      role: "HSE",
    },
  })

  await prisma.user.upsert({
    where: { email: "supervisor@empresa.com" },
    update: {},
    create: {
      email: "supervisor@empresa.com",
      password: passwordHash,
      name: "Supervisor de Área",
      role: "SUPERVISOR",
    },
  })

  await prisma.user.upsert({
    where: { email: "gerente@empresa.com" },
    update: {},
    create: {
      email: "gerente@empresa.com",
      password: passwordHash,
      name: "Gerente de Planta",
      role: "MANAGER",
    },
  })

  await prisma.user.upsert({
    where: { email: "reportante@empresa.com" },
    update: {},
    create: {
      email: "reportante@empresa.com",
      password: passwordHash,
      name: "Trabajador Campo",
      role: "REPORTER",
    },
  })

  console.log("Seed completed successfully!")
  console.log("Users created (password: admin123):")
  console.log("  admin@empresa.com (ADMIN)")
  console.log("  hse@empresa.com (HSE)")
  console.log("  supervisor@empresa.com (SUPERVISOR)")
  console.log("  gerente@empresa.com (MANAGER)")
  console.log("  reportante@empresa.com (REPORTER)")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
