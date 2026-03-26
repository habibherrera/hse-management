import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
})

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "hse@empresa.com",
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Error sending email:", error)
  }
}

export function eventCreatedEmail(eventNumber: string, description: string, ownerName: string) {
  return {
    subject: `[HSE] Nuevo evento registrado: ${eventNumber}`,
    html: `
      <h2>Nuevo evento HSE registrado</h2>
      <p><strong>Número:</strong> ${eventNumber}</p>
      <p><strong>Descripción:</strong> ${description}</p>
      <p><strong>Responsable:</strong> ${ownerName}</p>
      <p>Ingrese al sistema para ver los detalles y dar seguimiento.</p>
    `,
  }
}

export function actionDueReminderEmail(eventNumber: string, actionTitle: string, dueDate: string) {
  return {
    subject: `[HSE] Acción próxima a vencer: ${actionTitle}`,
    html: `
      <h2>Recordatorio de acción correctiva</h2>
      <p><strong>Evento:</strong> ${eventNumber}</p>
      <p><strong>Acción:</strong> ${actionTitle}</p>
      <p><strong>Fecha compromiso:</strong> ${dueDate}</p>
      <p>Por favor atienda esta acción antes de su vencimiento.</p>
    `,
  }
}
