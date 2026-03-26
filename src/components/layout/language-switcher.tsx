"use client"

import { useTranslation } from "@/providers/i18n-provider"
import type { Locale } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-800/50 p-0.5">
      <button
        onClick={() => setLocale("es" as Locale)}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
          locale === "es"
            ? "bg-white/15 text-white"
            : "text-slate-400 hover:text-white"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLocale("en" as Locale)}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
          locale === "en"
            ? "bg-white/15 text-white"
            : "text-slate-400 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  )
}
