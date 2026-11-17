"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Globe, Server } from "lucide-react"
import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
      .channel("infra_settings_changes_badge")
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
    if (days === null) return { color: "text-muted-foreground bg-muted/60", label: "Belum diset", isWarning: false }
    if (days < 0) return { color: "text-rose-600 bg-rose-500/10 border-rose-500/30", label: "Expired", isWarning: true }
    if (days <= 7) return { color: "text-rose-600 bg-rose-500/10 border-rose-500/30", label: `${days} hr`, isWarning: true }
    if (days <= 30) return { color: "text-amber-600 bg-amber-500/10 border-amber-500/30", label: `${days} hr`, isWarning: true }
    return { color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30", label: `${days} hr`, isWarning: false }
  }

  const domainStatus = getStatusBadge(domainDays)
  const vpsStatus = getStatusBadge(vpsDays)
  const hasUrgentWarning = domainStatus.isWarning || vpsStatus.isWarning

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden pt-2">
      <SidebarGroupLabel className="flex items-center justify-between">
        <span>Masa Aktif Server</span>
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            hasUrgentWarning ? "bg-amber-500 animate-ping" : "bg-emerald-500"
          }`}
          title={hasUrgentWarning ? "Ada layanan mendekati expired" : "Kondisi aman"}
        />
      </SidebarGroupLabel>
      <SidebarMenu>
        {/* Domain Item */}
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href="/settings" />}
            className="flex items-center justify-between w-full"
            title={`Domain: ${infra.domain_name} (Expired: ${formatDisplayDate(infra.domain_expiry)})`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="truncate">{infra.domain_name || "Domain"}</span>
            </div>
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${domainStatus.color}`}
            >
              {domainStatus.label}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* VPS Item */}
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href="/settings" />}
            className="flex items-center justify-between w-full"
            title={`VPS: ${infra.vps_name} (Expired: ${formatDisplayDate(infra.vps_expiry)})`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Server className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="truncate">{infra.vps_name || "VPS"}</span>
            </div>
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${vpsStatus.color}`}
            >
              {vpsStatus.label}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
