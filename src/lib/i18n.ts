import es from "@/messages/es.json"
import en from "@/messages/en.json"

export type Locale = "es" | "en"

const messages: Record<Locale, typeof es> = { es, en }

export function getMessages(locale: Locale) {
  return messages[locale] || messages.es
}

/**
 * Get a nested translation value by dot-separated key.
 * Supports simple {variable} interpolation.
 */
export function t(
  msgs: typeof es,
  key: string,
  vars?: Record<string, string | number>
): string {
  const keys = key.split(".")
  let value: any = msgs
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) return key
  }
  if (typeof value !== "string") return key
  if (vars) {
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      vars[name] !== undefined ? String(vars[name]) : `{${name}}`
    )
  }
  return value
}

export function getLocaleFromCookie(cookieHeader?: string): Locale {
  if (!cookieHeader) return "es"
  const match = cookieHeader.match(/(?:^|;\s*)locale=(es|en)/)
  return (match?.[1] as Locale) || "es"
}
