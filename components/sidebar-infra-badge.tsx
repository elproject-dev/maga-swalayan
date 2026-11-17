"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Globe, Server, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface InfraSettings {
  domain_name: string
  domain_expiry: string | null
  vps_name: string
  vps_expiry: string | null
  show_in_sidebar: boolean
}

function calculateDaysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return "-"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function SidebarInfraBadge() {
  const [infra, setInfra] = useState<InfraSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchInfra = async () => {
      try {
        const { data } = await supabase
          .from("infra_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle()

        if (isMounted && data) {
          setInfra(data)
        }
      } catch (err) {
        console.error("Error fetching infra settings:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchInfra()

    // Listen to changes in infra_settings
    const channel = supabase
      .channel("infra_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "infra_settings" },
        (payload) => {
          if (payload.new && (payload.new as any).id === 1) {
            setInfra(payload.new as InfraSettings)
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading || !infra || !infra.show_in_sidebar) {
    return null
  }

  const domainDays = calculateDaysLeft(infra.domain_expiry)
  const vpsDays = calculateDaysLeft(infra.vps_expiry)

  const getStatusBadge = (days: number | null) => {
    if (days === null) return { color: "text-muted-foreground bg-muted", label: "Belum diset", isWarning: false }
    if (days < 0) return { color: "text-rose-600 bg-rose-500/10 border-rose-500/30", label: "Expired", isWarning: true }
    if (days <= 7) return { color: "text-rose-600 bg-rose-500/10 border-rose-500/30", label: `${days} hr (Kritis)`, isWarning: true }
    if (days <= 30) return { color: "text-amber-600 bg-amber-500/10 border-amber-500/30", label: `${days} hr`, isWarning: true }
    return { color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30", label: `${days} hr`, isWarning: false }
  }

  const domainStatus = getStatusBadge(domainDays)
  const vpsStatus = getStatusBadge(vpsDays)
  const hasUrgentWarning = domainStatus.isWarning || vpsStatus.isWarning

  return (
    <div className="mx-2 mb-2 p-2.5 rounded-lg border border-border/70 bg-card/70 backdrop-blur-xs text-xs space-y-2 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 font-semibold text-[11px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
          title="Klik untuk ubah di Pengaturan Manajemen"
        >
          {hasUrgentWarning ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          )}
          Masa Aktif Server
        </Link>
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            hasUrgentWarning ? "bg-amber-500 animate-ping" : "bg-emerald-500"
          }`}
        />
      </div>

      {/* Domain Row */}
      <div className="flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground truncate" title={infra.domain_name || "Domain"}>
          <Globe className="w-3 h-3 text-sky-500 shrink-0" />
          <span className="truncate max-w-[90px]">{infra.domain_name || "Domain"}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${domainStatus.color}`}
          title={`Expired: ${formatDisplayDate(infra.domain_expiry)}`}
        >
          {domainStatus.label}
        </span>
      </div>

      {/* VPS Row */}
      <div className="flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground truncate" title={infra.vps_name || "VPS"}>
          <Server className="w-3 h-3 text-purple-500 shrink-0" />
          <span className="truncate max-w-[90px]">{infra.vps_name || "VPS"}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${vpsStatus.color}`}
          title={`Expired: ${formatDisplayDate(infra.vps_expiry)}`}
        >
          {vpsStatus.label}
        </span>
      </div>
    </div>
  )
}
