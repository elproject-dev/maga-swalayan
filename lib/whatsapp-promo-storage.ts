import { supabase } from "@/lib/supabase"

export interface PromoTemplate {
  id: number
  name: string
  content: string
  is_default?: boolean
}

export interface SaveTemplateResult {
  template: PromoTemplate
  savedToSupabase: boolean
  errorMessage?: string
}

export const DEFAULT_PROMO_TEMPLATES: PromoTemplate[] = [
  {
    id: -1,
    name: "Template Poin",
    is_default: true,
    content:
      "Hai @!\nAda kabar bahagia dari # 💖\n\n🔥 *PROMO HARI INI* 🔥\n\nPoin belanja Anda saat ini: %\n\n🎁 Yuk, tukarkan poin Anda sekarang dan dapatkan potongan belanja spesial hanya di #.\n\nKarena kepuasan Anda selalu kami utamakan!\n\n💝 Salam,\n#",
  },
  {
    id: -2,
    name: "Template Member Baru",
    is_default: true,
    content:
      "🎉 *PROMO SPESIAL MEMBER* 🎉\n\nHalo @ 😊\n\n🎁 Ada promo menarik buat Anda!\n\nDapatkan diskon dan penawaran hemat untuk pembelanjaan berikutnya di #.\n\n📍 Yuk kunjungi # sekarang!\n\n🙏 Salam hangat,\n#",
  },
  {
    id: -3,
    name: "Template Promo Hemat",
    is_default: true,
    content:
      "🛒 *PROMO HEMAT* # 🛒\n\nHalo @!\nNikmati berbagai promo harga spesial dan diskon produk kebutuhan harian minggu ini di #.\n\nJangan sampai terlewatkan ya!\n\n✨ Salam,\n#",
  },
]

const STORAGE_KEY_TEMPLATES = "maga_promo_templates"
const STORAGE_KEY_LOGS = "maga_promo_sent_logs"
const STORAGE_KEY_COOLDOWN = "maga_promo_cooldown_days"

function isClient(): boolean {
  return typeof window !== "undefined"
}

function getLocalTemplates(): PromoTemplate[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalTemplates(templates: PromoTemplate[]) {
  if (!isClient()) return
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates))
  } catch {}
}

/**
 * Checks if the required tables exist in Supabase schema.
 */
export async function checkSupabasePromoTableStatus(): Promise<{
  templatesTableExists: boolean
  logsTableExists: boolean
}> {
  let templatesTableExists = false
  let logsTableExists = false

  try {
    const { error: tErr } = await supabase.from("promo_templates").select("id").limit(1)
    if (!tErr) templatesTableExists = true
  } catch {}

  try {
    const { error: lErr } = await supabase.from("promo_sent_logs").select("id").limit(1)
    if (!lErr) logsTableExists = true
  } catch {}

  return { templatesTableExists, logsTableExists }
}

/**
 * Fetch all promo templates (combining Supabase custom templates, local fallback, and default templates).
 */
export async function getPromoTemplates(): Promise<PromoTemplate[]> {
  let customTemplates: PromoTemplate[] = []

  try {
    const { data, error } = await supabase
      .from("promo_templates")
      .select("id, name, content")
      .order("created_at", { ascending: false })

    if (!error && data && data.length > 0) {
      customTemplates = data.map((item: any) => ({
        id: Number(item.id),
        name: item.name,
        content: item.content,
        is_default: false,
      }))
      // Sync back to local storage as cache
      setLocalTemplates(customTemplates)
    } else {
      if (error) {
        console.warn("[WhatsAppPromo] Supabase promo_templates select warning:", error.message)
      }
      customTemplates = getLocalTemplates()
    }
  } catch {
    customTemplates = getLocalTemplates()
  }

  return [...customTemplates, ...DEFAULT_PROMO_TEMPLATES]
}

/**
 * Saves (inserts or updates) a custom promo template.
 */
export async function savePromoTemplate(template: {
  id?: number
  name: string
  content: string
}): Promise<SaveTemplateResult> {
  const isUpdate = !!template.id && template.id > 0
  let savedTemplate: PromoTemplate | null = null
  let supabaseErrorMsg: string | undefined

  try {
    let currentUserId: string | null = null
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      currentUserId = session?.user?.id || null
    } catch {}

    if (isUpdate) {
      const { data, error } = await supabase
        .from("promo_templates")
        .update({
          name: template.name,
          content: template.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", template.id)
        .select()
        .single()

      if (!error && data) {
        savedTemplate = {
          id: Number(data.id),
          name: data.name,
          content: data.content,
          is_default: false,
        }
      } else if (error) {
        supabaseErrorMsg = error.message
        console.warn("[WhatsAppPromo] Gagal update ke Supabase:", error.message)
      }
    } else {
      const { data, error } = await supabase
        .from("promo_templates")
        .insert([
          {
            name: template.name,
            content: template.content,
            owner_id: currentUserId,
          },
        ])
        .select()
        .single()

      if (!error && data) {
        savedTemplate = {
          id: Number(data.id),
          name: data.name,
          content: data.content,
          is_default: false,
        }
      } else if (error) {
        supabaseErrorMsg = error.message
        console.warn("[WhatsAppPromo] Gagal insert ke Supabase:", error.message)
      }
    }
  } catch (err: any) {
    supabaseErrorMsg = err?.message || "Kesalahan koneksi Supabase"
    console.warn("[WhatsAppPromo] Supabase exception:", err)
  }

  // Local storage fallback sync
  const localList = getLocalTemplates()
  if (savedTemplate) {
    const idx = localList.findIndex((t) => t.id === savedTemplate!.id)
    if (idx >= 0) {
      localList[idx] = savedTemplate
    } else {
      localList.unshift(savedTemplate)
    }
    setLocalTemplates(localList)
    return {
      template: savedTemplate,
      savedToSupabase: true,
    }
  } else {
    // If Supabase failed or table doesn't exist, handle in localStorage
    if (isUpdate) {
      const idx = localList.findIndex((t) => t.id === template.id)
      const updated: PromoTemplate = {
        id: template.id!,
        name: template.name,
        content: template.content,
        is_default: false,
      }
      if (idx >= 0) localList[idx] = updated
      else localList.unshift(updated)
      setLocalTemplates(localList)
      return {
        template: updated,
        savedToSupabase: false,
        errorMessage: supabaseErrorMsg,
      }
    } else {
      const newTemplate: PromoTemplate = {
        id: Date.now(),
        name: template.name,
        content: template.content,
        is_default: false,
      }
      localList.unshift(newTemplate)
      setLocalTemplates(localList)
      return {
        template: newTemplate,
        savedToSupabase: false,
        errorMessage: supabaseErrorMsg,
      }
    }
  }
}

/**
 * Deletes a custom template by ID.
 */
export async function deletePromoTemplate(
  id: number
): Promise<{ success: boolean; deletedFromSupabase: boolean }> {
  if (id < 0) return { success: false, deletedFromSupabase: false }

  let deletedFromSupabase = false
  try {
    const { error } = await supabase.from("promo_templates").delete().eq("id", id)
    if (!error) {
      deletedFromSupabase = true
    } else {
      console.warn("[WhatsAppPromo] Gagal delete dari Supabase:", error.message)
    }
  } catch {}

  const localList = getLocalTemplates().filter((t) => t.id !== id)
  setLocalTemplates(localList)
  return { success: true, deletedFromSupabase }
}

/**
 * Fetches sent logs mapping customer ID to latest sent ISO timestamp.
 */
export async function getSentLogs(): Promise<Map<number, string>> {
  const logMap = new Map<number, string>()

  // 1. Read from localStorage first
  if (isClient()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOGS)
      if (raw) {
        const obj = JSON.parse(raw)
        Object.entries(obj).forEach(([cid, timestamp]) => {
          logMap.set(Number(cid), String(timestamp))
        })
      }
    } catch {}
  }

  // 2. Overlay with Supabase records if available
  try {
    const { data, error } = await supabase
      .from("promo_sent_logs")
      .select("customer_id, sent_at")
      .order("sent_at", { ascending: false })

    if (!error && data) {
      data.forEach((log: any) => {
        const cid = Number(log.customer_id)
        if (
          !logMap.has(cid) ||
          new Date(log.sent_at).getTime() > new Date(logMap.get(cid)!).getTime()
        ) {
          logMap.set(cid, log.sent_at)
        }
      })
    }
  } catch {}

  return logMap
}

/**
 * Records that a promo message was sent to a customer.
 */
export async function recordSentLog(customerId: number, templateId?: number): Promise<void> {
  const nowIso = new Date().toISOString()

  // Save to localStorage immediately
  if (isClient()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOGS)
      const obj = raw ? JSON.parse(raw) : {}
      obj[customerId] = nowIso
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(obj))
    } catch {}
  }

  // Persist to Supabase if table exists
  try {
    let currentUserId: string | null = null
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      currentUserId = session?.user?.id || null
    } catch {}

    const { error } = await supabase.from("promo_sent_logs").insert([
      {
        customer_id: customerId,
        template_id: templateId && templateId > 0 ? templateId : null,
        owner_id: currentUserId,
      },
    ])
    if (error) {
      console.warn("[WhatsAppPromo] Gagal simpan log ke Supabase:", error.message)
    }
  } catch {}
}

/**
 * Resets all sent logs (both in Supabase and in localStorage).
 */
export async function resetSentLogs(): Promise<void> {
  if (isClient()) {
    try {
      localStorage.removeItem(STORAGE_KEY_LOGS)
    } catch {}
  }

  try {
    await supabase.from("promo_sent_logs").delete().neq("id", 0)
  } catch {}
}

/**
 * Gets the configured cooldown days (default: 7).
 */
export function getCooldownDays(): number {
  if (!isClient()) return 7
  try {
    const saved = localStorage.getItem(STORAGE_KEY_COOLDOWN)
    return saved ? parseInt(saved, 10) || 7 : 7
  } catch {
    return 7
  }
}

/**
 * Sets the configured cooldown days.
 */
export function setCooldownDays(days: number): void {
  if (!isClient()) return
  try {
    localStorage.setItem(STORAGE_KEY_COOLDOWN, String(days))
  } catch {}
}
