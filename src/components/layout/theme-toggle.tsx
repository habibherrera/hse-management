"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTranslation } from "@/providers/i18n-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-slate-800/50 p-0.5">
        <div className="rounded-md px-2 py-1.5">
          <Sun className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    )
  }

  const modes = [
    { key: "light", icon: Sun, label: t("theme.light") },
    { key: "dark", icon: Moon, label: t("theme.dark") },
    { key: "system", icon: Monitor, label: t("theme.system") },
  ] as const

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-800/50 p-0.5" title={t("theme.toggle")}>
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => setTheme(mode.key)}
          className={`rounded-md px-2 py-1.5 transition-all ${
            theme === mode.key
              ? "bg-white/15 text-white"
              : "text-slate-400 hover:text-white"
          }`}
          title={mode.label}
        >
          <mode.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}
