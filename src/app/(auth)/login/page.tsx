"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/providers/i18n-provider"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Shield, ArrowRight, AlertTriangle, HardHat, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(t("login.invalidCredentials"))
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-[55%] login-gradient grid-pattern relative flex-col justify-between p-12 text-white">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 backdrop-blur-sm border border-amber-500/20">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HSE Platform</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Health, Safety & Environment</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-6">
            {t("login.tagline1")}
            <br />
            <span className="text-amber-400">{t("login.tagline2")}</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-10">
            {t("login.heroDescription")}
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: AlertTriangle, label: t("login.featureRegistration"), sublabel: t("login.featureRegistrationSub") },
              { icon: HardHat, label: t("login.featureTracking"), sublabel: t("login.featureTrackingSub") },
              { icon: Shield, label: t("login.featureClosure"), sublabel: t("login.featureClosureSub") },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <item.icon className="h-5 w-5 text-amber-400 mb-3" />
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-slate-400">{item.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-500">
            {t("login.platformVersion")}
          </p>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-white dark:bg-[hsl(224,30%,8%)]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">HSE Platform</h1>
              <p className="text-xs text-muted-foreground">Health, Safety & Environment</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              {t("login.welcome")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("login.enterCredentials")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="email">
                {t("common.email")}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 text-sm text-foreground transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="password">
                {t("common.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 pr-11 text-sm text-foreground transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-400 fade-in">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(220,70%,45%)] font-semibold text-white text-sm transition-all duration-200 hover:bg-[hsl(220,70%,40%)] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t("login.submit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-center text-slate-400">
              {t("login.restrictedAccess")}
              <br />
              {t("login.noAccountContact")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
