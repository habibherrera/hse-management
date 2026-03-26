import type { Metadata } from "next"
import { cookies } from "next/headers"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/layout/auth-provider"
import { I18nProvider } from "@/providers/i18n-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import type { Locale } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "HSE - Sistema de Gestión de Incidentes",
  description: "Plataforma de registro y seguimiento de incidentes y accidentes HSE",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value as Locale) || "es"

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider initialLocale={locale}>
              {children}
              <Toaster
                position="top-right"
                richColors
                toastOptions={{
                  style: {
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  },
                }}
              />
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
