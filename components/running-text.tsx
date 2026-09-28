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
  
  const duration = SPEED_MAP[config.speed] || SPEED_MAP.normal

  return (
    <div 
      className="relative flex items-center overflow-hidden h-8 select-none bg-zinc-100/50 dark:bg-zinc-800/30"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)'
      }}
    >
      {/* Seamless marquee — 2 identical copies */}
      <div
        className="flex shrink-0 min-w-full"
        style={{ animation: `marquee-scroll ${duration} linear infinite` }}
      >
        <span className="whitespace-nowrap flex items-center text-[11px] font-medium tracking-wide text-primary">
          {items.map((item, i) => (
            <span key={`first-${i}`} className="flex items-center">
              {item.text}
              <span className="mx-6 text-primary/50">•</span>
            </span>
          ))}
        </span>
        <span className="whitespace-nowrap flex items-center text-[11px] font-medium tracking-wide text-primary">
          {items.map((item, i) => (
            <span key={`second-${i}`} className="flex items-center">
              {item.text}
              <span className="mx-6 text-primary/50">•</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
