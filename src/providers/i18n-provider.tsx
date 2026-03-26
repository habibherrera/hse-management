"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Locale } from "@/lib/i18n"
import { getMessages, t as translate } from "@/lib/i18n"
import es from "@/messages/es.json"

type Messages = typeof es

interface I18nContextType {
  locale: Locale
  messages: Messages
  t: (key: string, vars?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({
  children,
  initialLocale = "es",
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [msgs, setMsgs] = useState<Messages>(getMessages(initialLocale))

  useEffect(() => {
    // Read cookie on mount
    const match = document.cookie.match(/(?:^|;\s*)locale=(es|en)/)
    if (match) {
      const saved = match[1] as Locale
      setLocaleState(saved)
      setMsgs(getMessages(saved))
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setMsgs(getMessages(newLocale))
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`
    // Refresh server components
    window.location.reload()
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(msgs, key, vars),
    [msgs]
  )

  return (
    <I18nContext.Provider value={{ locale, messages: msgs, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider")
  return ctx
}
