import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
  d.setHours(Math.floor(Math.random() * 14) + 6) // 6am-8pm
  d.setMinutes(Math.floor(Math.random() * 60))
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const eventDescriptions = [
  "Trabajador resbaló en área de producción debido a derrame de aceite no señalizado. Se aplicaron primeros auxilios.",
  "Se detectó fuga de vapor en tubería principal del sector B. Se acordonó la zona y se notificó a mantenimiento.",
  "Operador de montacargas casi colisiona con peatón en cruce de pasillo. No hubo contacto físico.",
  "Extintor vencido encontrado en almacén zona C. Sin señalización de evacuación actualizada.",
  "Caída de material apilado en rack de almacenamiento. No había personal en la zona al momento del incidente.",
  "Trabajador no portaba equipo de protección personal completo en zona de soldadura.",
  "Corto circuito en panel eléctrico del taller mecánico. Se activó protocolo de emergencia eléctrica.",
  "Derrame de químico (solvente) en laboratorio de calidad. Se contuvo con kit de derrames disponible.",
  "Escalera portátil en mal estado utilizada por personal de mantenimiento. Se retiró de servicio.",
  "Vehículo de transporte interno circuló a velocidad excesiva en zona peatonal de la planta.",
  "Se encontró válvula de seguridad deshabilitada en caldera principal. Riesgo crítico de sobrepresión.",
  "Trabajador sufrió quemadura leve en antebrazo por salpicadura de soldadura. Atendido en enfermería.",
  "Rack de almacenamiento con sobrecarga visible. Se excede la capacidad máxima señalizada.",
  "Falta de iluminación en pasillo de emergencia sector A. Lámparas de emergencia sin funcionar.",
  "Conato de incendio en contenedor de residuos. Extinguido por brigada interna sin daños mayores.",
  "Personal de contratista trabajando en altura sin arnés de seguridad debidamente anclado.",
  "Exposición prolongada a ruido sin protección auditiva en área de compresores.",
  "Se detectó grieta en estructura de soporte de grúa puente. Se suspendió operación hasta inspección.",
  "Accidente vehicular menor en estacionamiento de planta. Daño material solamente.",
  "Fuga de gas natural detectada por sensor en sala de calderas. Evacuación preventiva realizada.",
  "Piso mojado sin señalización en cafetería. Dos trabajadores reportaron casi resbalarse.",
  "Herramienta eléctrica sin conexión a tierra utilizada en área húmeda de lavado.",
  "Caída de trabajador desde plataforma de 1.5m durante labores de limpieza industrial.",
  "Obstrucción parcial de salida de emergencia por almacenamiento temporal de materiales.",
  "Quemadura química en manos por manipulación de ácido sin guantes adecuados.",
  "Colisión de montacargas con estructura de rack. Daño estructural menor, sin lesiones.",
  "Atrapamiento de mano en banda transportadora. Trabajador liberado y trasladado a hospital.",
  "Condiciones de orden y limpieza deficientes en taller de mantenimiento eléctrico.",
  "Incidente de descarga eléctrica al manipular tablero sin bloqueo/etiquetado (LOTO).",
  "Caída de objeto desde segundo nivel durante maniobra de izaje. Perímetro estaba acordonado.",
]

const actionTitles = [
  "Instalar señalización de piso mojado permanente",
  "Capacitar personal en uso correcto de EPP",
  "Reemplazar extintor vencido y actualizar programa de inspección",
  "Reparar iluminación de emergencia en sector afectado",
  "Implementar programa de inspección de racks",
  "Instalar barreras físicas en cruces peatonales",
  "Revisar y actualizar procedimiento de bloqueo/etiquetado",
  "Realizar mantenimiento correctivo de sistema eléctrico",
  "Colocar kit de contención de derrames adicional",
  "Actualizar señalización de rutas de evacuación",
  "Programar capacitación de manejo defensivo",
  "Instalar protecciones en maquinaria rotatoria",
  "Reparar escalera y comprar reemplazos certificados",
  "Implementar control de velocidad en vías internas",
  "Despejar y señalizar salidas de emergencia",
  "Reparar sistema de detección de gas",
  "Instalar guardas de seguridad en banda transportadora",
  "Actualizar matriz de EPP por área",
  "Programar inspección estructural de grúa puente",
  "Implementar checklist diario de preoperación",
]

async function main() {
  console.log("Generating test data...")

  // Clean existing test events (and cascaded children)
  console.log("  Cleaning previous test data...")
  await prisma.evidence.deleteMany({})
  await prisma.investigation.deleteMany({})
  await prisma.correctiveAction.deleteMany({})
  await prisma.event.deleteMany({})

  // Fetch all catalog data
  const eventTypes = await prisma.eventType.findMany({ orderBy: { sortOrder: "asc" } })
  const severities = await prisma.severity.findMany({ orderBy: { sortOrder: "asc" } })
  const statuses = await prisma.eventStatus.findMany({ orderBy: { sortOrder: "asc" } })
  const sites = await prisma.site.findMany()
  const areas = await prisma.area.findMany()
  const projects = await prisma.project.findMany()
  const shifts = await prisma.shift.findMany()
  const contractors = await prisma.contractor.findMany()
  const users = await prisma.user.findMany()

  if (eventTypes.length === 0 || severities.length === 0 || statuses.length === 0) {
    console.error("Run the base seed first: npx prisma db seed")
    process.exit(1)
  }

  const statusMap: Record<string, string> = {}
  for (const s of statuses) {
    statusMap[s.code] = s.id
  }

  const typeMap: Record<string, string> = {}
  for (const t of eventTypes) {
    typeMap[t.code] = t.id
  }

  const sevMap: Record<string, string> = {}
  for (const s of severities) {
    sevMap[s.code] = s.id
  }

  const hseUser = users.find((u) => u.role === "HSE")!
  const supervisorUser = users.find((u) => u.role === "SUPERVISOR")!
  const adminUser = users.find((u) => u.role === "ADMIN")!
  const reporterUser = users.find((u) => u.role === "REPORTER")!
  const managerUser = users.find((u) => u.role === "MANAGER")!
  const allOwners = [hseUser, supervisorUser, adminUser]

  // Update event sequence counter
  const currentYear = new Date().getFullYear()
  await prisma.eventSequence.upsert({
    where: { id: "singleton" },
    update: { year: currentYear, counter: 0 },
    create: { id: "singleton", year: currentYear, counter: 0 },
  })

  // Generate 35 events spread across last 90 days
  const events: Array<{
    id: string
    eventTypeCode: string
    statusCode: string
    severityCode: string
    eventDate: Date
  }> = []

  // Distribution: mix of statuses for realistic dashboard
  const statusDistribution = [
    // 8 open events
    ...Array(8).fill("ABIERTO"),
    // 10 in-progress
    ...Array(10).fill("EN_SEGUIMIENTO"),
    // 5 pending close
    ...Array(5).fill("PENDIENTE_CIERRE"),
    // 12 closed
    ...Array(12).fill("CERRADO"),
  ]

  // Severity distribution: more low/medium, fewer critical
  const severityDistribution = [
    ...Array(10).fill("BAJA"),
    ...Array(12).fill("MEDIA"),
    ...Array(9).fill("ALTA"),
    ...Array(4).fill("CRITICA"),
  ]

  // Type distribution
  const typeDistribution = [
    ...Array(10).fill("INCIDENTE"),
    ...Array(5).fill("ACCIDENTE"),
    ...Array(8).fill("CUASI_ACCIDENTE"),
    ...Array(7).fill("CONDICION_INSEGURA"),
    ...Array(5).fill("ACTO_INSEGURO"),
  ]

  for (let i = 0; i < 35; i++) {
    const eventNumber = `EVT-${currentYear}-${String(i + 1).padStart(4, "0")}`
    const eventDate = randomDate(90)
    const statusCode = statusDistribution[i]
    const severityCode = severityDistribution[i]
    const eventTypeCode = typeDistribution[i]
    const isAnonymous = Math.random() < 0.15
    const isConfidential = Math.random() < 0.1
    const owner = randomItem(allOwners)
    const reporter = isAnonymous ? null : randomItem([reporterUser, supervisorUser, hseUser])
    const useContractor = Math.random() < 0.35
    const useProject = Math.random() < 0.6

    const closedAt =
      statusCode === "CERRADO" ? addDays(eventDate, Math.floor(Math.random() * 20) + 1) : null

    const dueDate = addDays(
      eventDate,
      severityCode === "CRITICA"
        ? 3
        : severityCode === "ALTA"
          ? 7
          : severityCode === "MEDIA"
            ? 15
            : 30
    )

    const event = await prisma.event.create({
      data: {
        eventNumber,
        eventDateTime: eventDate,
        reportedAt: addDays(eventDate, Math.random() < 0.7 ? 0 : 1),
        description: eventDescriptions[i % eventDescriptions.length],
        isAnonymous,
        isConfidential,
        dueDate,
        closedAt,
        eventTypeId: typeMap[eventTypeCode],
        severityId: sevMap[severityCode],
        statusId: statusMap[statusCode],
        siteId: randomItem(sites).id,
        areaId: randomItem(areas).id,
        projectId: useProject ? randomItem(projects).id : null,
        shiftId: randomItem(shifts).id,
        contractorId: useContractor ? randomItem(contractors).id : null,
        reporterUserId: reporter?.id || null,
        ownerUserId: owner.id,
        createdById: reporter?.id || adminUser.id,
        updatedById: owner.id,
      },
    })

    events.push({
      id: event.id,
      eventTypeCode,
      statusCode,
      severityCode,
      eventDate,
    })

    console.log(`  Created event ${eventNumber} (${eventTypeCode}, ${severityCode}, ${statusCode})`)
  }

  // Update event sequence counter
  await prisma.eventSequence.update({
    where: { id: "singleton" },
    data: { counter: 35 },
  })

  // Generate corrective actions for events that are in-progress, pending close, or closed
  let actionCount = 0
  for (const event of events) {
    if (event.statusCode === "ABIERTO" && Math.random() > 0.3) continue // some open events have no actions

    const numActions =
      event.statusCode === "ABIERTO"
        ? 1
        : event.statusCode === "EN_SEGUIMIENTO"
          ? Math.floor(Math.random() * 2) + 1
          : Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < numActions; j++) {
      const actionOwner = randomItem([hseUser, supervisorUser])
      const actionDue = addDays(event.eventDate, Math.floor(Math.random() * 14) + 3)
      const isPastDue = actionDue < new Date()

      let actionStatus: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE"
      if (event.statusCode === "CERRADO") {
        actionStatus = "COMPLETED"
      } else if (isPastDue && Math.random() < 0.4) {
        actionStatus = "OVERDUE"
      } else if (event.statusCode === "EN_SEGUIMIENTO") {
        actionStatus = randomItem(["OPEN", "IN_PROGRESS", "IN_PROGRESS"] as const)
      } else {
        actionStatus = randomItem(["OPEN", "IN_PROGRESS", "COMPLETED"] as const)
      }

      await prisma.correctiveAction.create({
        data: {
          title: actionTitles[actionCount % actionTitles.length],
          description: `Acción derivada del evento. Prioridad ${event.severityCode.toLowerCase()}.`,
          dueDate: actionDue,
          status: actionStatus,
          closedAt: actionStatus === "COMPLETED" ? addDays(actionDue, -1) : null,
          eventId: event.id,
          ownerUserId: actionOwner.id,
          createdById: hseUser.id,
          updatedById: actionOwner.id,
        },
      })
      actionCount++
    }
  }
  console.log(`  Created ${actionCount} corrective actions`)

  // Generate investigations for accident-type events
  const accidents = events.filter((e) => e.eventTypeCode === "ACCIDENTE")
  let invCount = 0
  for (const accident of accidents) {
    let invStatus: "DRAFT" | "IN_REVIEW" | "APPROVED"
    if (accident.statusCode === "CERRADO") {
      invStatus = "APPROVED"
    } else if (accident.statusCode === "PENDIENTE_CIERRE") {
      invStatus = "IN_REVIEW"
    } else {
      invStatus = "DRAFT"
    }

    await prisma.investigation.create({
      data: {
        method: randomItem(["FIVE_WHYS", "CAUSE_TREE", "OTHER"] as const),
        summary:
          "Investigación del accidente para determinar causa raíz y factores contribuyentes. Se realizó análisis del sitio, entrevistas a testigos y revisión de procedimientos.",
        rootCause:
          invStatus !== "DRAFT"
            ? "Falta de supervisión directa durante la tarea, combinada con condiciones del área de trabajo que no cumplían con los estándares de seguridad establecidos."
            : null,
        findings:
          invStatus !== "DRAFT"
            ? "1. El procedimiento operativo no fue seguido correctamente.\n2. La señalización del área era insuficiente.\n3. El personal no contaba con la capacitación actualizada para la tarea.\n4. No se realizó evaluación de riesgos previa."
            : null,
        status: invStatus,
        completedAt: invStatus !== "DRAFT" ? addDays(accident.eventDate, 7) : null,
        approvedAt: invStatus === "APPROVED" ? addDays(accident.eventDate, 14) : null,
        eventId: accident.id,
        completedById: invStatus !== "DRAFT" ? hseUser.id : null,
        approvedById: invStatus === "APPROVED" ? managerUser.id : null,
      },
    })
    invCount++
  }
  console.log(`  Created ${invCount} investigations`)

  console.log("\n✓ Test data generated successfully!")
  console.log(`  Events: 35`)
  console.log(`  Corrective actions: ${actionCount}`)
  console.log(`  Investigations: ${invCount}`)
  console.log(`\nLogin with any user (password: admin123):`)
  console.log(`  admin@empresa.com | hse@empresa.com | supervisor@empresa.com`)
  console.log(`  gerente@empresa.com | reportante@empresa.com`)
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
