"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts"
import { useTranslation } from "@/providers/i18n-provider"

interface DashboardChartsProps {
  eventsByType: { name: string; count: number }[]
  eventsBySeverity: { name: string; color: string; count: number }[]
  eventsBySite: { name: string; count: number }[]
  eventsByArea: { name: string; count: number }[]
  weeklyTrend: { week: string; count: number }[]
  openEvents: number
  closedEvents: number
}

const chartTooltipStyle = {
  contentStyle: {
    background: "hsl(222 47% 11%)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "12px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    padding: "8px 14px",
    boxShadow: "0 10px 40px -12px rgba(0,0,0,0.3)",
  },
  itemStyle: { color: "#e2e8f0" },
  labelStyle: { color: "#94a3b8", fontWeight: 600, marginBottom: 4 },
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 card-hover">
      <h3 className="text-[13px] font-bold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function DashboardCharts({
  eventsByType, eventsBySeverity, eventsBySite, eventsByArea, weeklyTrend, openEvents, closedEvents,
}: DashboardChartsProps) {
  const { t } = useTranslation()

  const openClosedData = [
    { name: t("charts.open"), value: openEvents, color: "#F59E0B" },
    { name: t("charts.closed"), value: closedEvents, color: "#22C55E" },
  ]

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ChartCard title={t("charts.eventsByType")}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={eventsByType} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 93%)" vertical={false} />
            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "hsl(220 10% 50%)" }} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "hsl(220 10% 50%)" }} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="count" fill="hsl(220 70% 45%)" name={t("charts.events")} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t("charts.eventsBySeverity")}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={eventsBySeverity}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="count"
              strokeWidth={0}
            >
              {eventsBySeverity.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...chartTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 -mt-2">
          {eventsBySeverity.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
              <span className="font-bold text-foreground">{s.count}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title={t("charts.openVsClosed")}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={openClosedData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {openClosedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...chartTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 -mt-2">
          {openClosedData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span>{d.name}</span>
              <span className="font-bold text-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title={t("charts.weeklyTrend")}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 93%)" vertical={false} />
            <XAxis dataKey="week" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "hsl(220 10% 50%)" }} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "hsl(220 10% 50%)" }} />
            <Tooltip {...chartTooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(220 70% 45%)"
              strokeWidth={2.5}
              dot={{ fill: "hsl(220 70% 45%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(220 70% 45%)", stroke: "#fff", strokeWidth: 2 }}
              name={t("charts.events")}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t("charts.eventsBySite")}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={eventsBySite} layout="vertical" barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 93%)" horizontal={false} />
            <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "hsl(220 10% 50%)" }} />
            <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={110} tick={{ fill: "hsl(220 10% 50%)" }} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="count" fill="hsl(152 69% 41%)" name={t("charts.events")} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t("charts.eventsByArea")}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={eventsByArea} layout="vertical" barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 93%)" horizontal={false} />
            <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "hsl(220 10% 50%)" }} />
            <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={110} tick={{ fill: "hsl(220 10% 50%)" }} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="count" fill="hsl(36 95% 52%)" name={t("charts.events")} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
