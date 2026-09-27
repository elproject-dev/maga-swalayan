"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const SPEED_MAP: Record<string, string> = {
  slow: "70s",
  normal: "35s",
  fast: "18s",
}

export function RunningText() {
  const [items, setItems] = useState<any[]>([])
  const [config, setConfig] = useState<{ is_enabled: boolean; speed: string } | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: cfg }, { data: texts }] = await Promise.all([
        supabase.from("running_text_config").select("*").eq("id", 1).single(),
        supabase.from("running_text").select("*").eq("is_active", true).order("created_at", { ascending: true }),
      ])
      if (cfg) setConfig(cfg)
      if (texts) setItems(texts)
      setIsLoaded(true)
    }
    fetchAll()
  }, [])

  if (!isLoaded || !config?.is_enabled || items.length === 0) return null

  const combinedText = items.map((item) => item.text).join("     ·     ")
  const duration = SPEED_MAP[config.speed] || SPEED_MAP.normal

  return (
    <div className="relative flex items-center overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 h-8 select-none">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-zinc-100 dark:from-zinc-800 to-transparent pointer-events-none" />

      {/* Seamless marquee — 2 identical copies */}
      <div
        className="flex shrink-0 min-w-full"
        style={{ animation: `marquee-scroll ${duration} linear infinite` }}
      >
        <span className="whitespace-nowrap text-[11px] font-medium tracking-wide text-zinc-700 dark:text-zinc-300 pr-20">
          {combinedText}
        </span>
        <span className="whitespace-nowrap text-[11px] font-medium tracking-wide text-zinc-700 dark:text-zinc-300 pr-20">
          {combinedText}
        </span>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-zinc-100 dark:from-zinc-800 to-transparent pointer-events-none" />
    </div>
  )
}
