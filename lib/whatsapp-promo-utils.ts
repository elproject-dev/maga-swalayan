/**
 * Utility functions for WhatsApp Promo messaging and URL generation
 */

/**
 * Normalizes phone numbers to WhatsApp international format without '+' or special characters.
 * E.g. '0812-3456-7890' -> '6281234567890'
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return ""
  let clean = phone.replace(/\D/g, "")
  if (!clean || clean.length < 8) return ""
  if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1)
  } else if (!clean.startsWith("62")) {
    clean = "62" + clean
  }
  return clean
}

/**
 * Replaces placeholders in message templates:
 * - '@' -> '*Nama Pelanggan*'
 * - '#' -> '*Nama Toko*' (Default: Maga Swalayan)
 * - '%' -> '*Poin*'
 */
export function formatWhatsAppMessage(
  template: string,
  data: { name: string; storeName?: string; points?: number }
): string {
  const cleanName = (data.name || "").trim()
  const cleanStore = (data.storeName || "Maga Swalayan").trim()
  const points = data.points ?? 0

  return (template || "")
    .replace(/@/g, () => `*${cleanName}*`)
    .replace(/#/g, () => `*${cleanStore}*`)
    .replace(/%/g, () => `*${points}*`)
}

/**
 * Generates the WhatsApp API URL with encoded message text.
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatWhatsAppPhone(phone)
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`
}

/**
 * Checks if a customer was already sent a message within the specified cooldown days.
 */
export function checkIsSentWithinCooldown(
  lastSentIso: string | undefined | null,
  cooldownDays: number
): boolean {
  if (!lastSentIso) return false
  const sentDate = new Date(lastSentIso)
  if (isNaN(sentDate.getTime())) return false

  const diffMs = Math.abs(Date.now() - sentDate.getTime())
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return diffDays <= cooldownDays
}
