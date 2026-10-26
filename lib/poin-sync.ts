import { supabase } from '@/lib/supabase'

export function normalizePhone(phone?: string | null): string {
  if (!phone || phone === '-') return ''
  const digits = String(phone).replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('62')) return '0' + digits.slice(2)
  if (digits.startsWith('0')) return digits
  return '0' + digits
}

export function normalizeCard(card?: string | null): string {
  if (!card || card === '-') return ''
  return String(card).trim().toUpperCase()
}

export interface SyncResult {
  totalSynced: number
  newCustomersCreated: number
  customersUpdated: number
}

/**
 * Sinkronisasi data poin_transactions ke tabel pelanggan:
 * 1. Menghitung akumulasi poin untuk seluruh pelanggan berdasarkan membercard & nomor telepon.
 * 2. Memperbarui kolom `points` pada tabel pelanggan di database.
 * 3. Menambahkan member/pelanggan baru ke tabel pelanggan jika ada data di transaksi yang belum terdaftar.
 */
export async function syncPoinWithPelanggan(): Promise<SyncResult> {
  // 1. Ambil semua transaksi
  const { data: transactions, error: trxError } = await supabase
    .from('poin_transactions')
    .select('idtransaksi, membercard, notelp, poin, tipe')

  if (trxError) {
    console.error('Error fetching poin_transactions for sync:', trxError)
    throw trxError
  }

  // 2. Ambil semua data pelanggan yang ada
  const { data: pelangganList, error: custError } = await supabase
    .from('pelanggan')
    .select('*')

  if (custError) {
    console.error('Error fetching pelanggan for sync:', custError)
    throw custError
  }

  const currentPelanggan = pelangganList || []
  const allTrx = transactions || []

  let newCustomersCreated = 0
  let customersUpdated = 0

  // 3. Lacak transaksi mana yang sudah dipasangkan dengan existing pelanggan
  const matchedTrxIndices = new Set<number>()

  // 4. Update data & poin untuk pelanggan yang sudah ada di database
  for (const cust of currentPelanggan) {
    const custCard = normalizeCard(cust.membercard)
    const custPhone = normalizePhone(cust.phone)

    const matchingTrx = allTrx.filter((trx, idx) => {
      const trxCard = normalizeCard(trx.membercard)
      const trxPhone = normalizePhone(trx.notelp)

      const cardMatches = custCard && trxCard && custCard === trxCard
      const phoneMatches = custPhone && trxPhone && custPhone === trxPhone

      if (cardMatches || phoneMatches) {
        matchedTrxIndices.add(idx)
        return true
      }
      return false
    })

    const netPoints = matchingTrx.reduce((sum, trx) => {
      const pts = Number(trx.poin) || 0
      const isPlus = (trx.tipe || 'plus').toLowerCase() === 'plus'
      return isPlus ? sum + pts : sum - pts
    }, 0)

    // Cek apakah ada update membercard atau phone yang bisa dilengkapi dari transaksi
    let updatedCard = cust.membercard
    let updatedPhone = cust.phone

    if ((!updatedCard || updatedCard === '-') && matchingTrx.length > 0) {
      const foundCard = matchingTrx.find(t => normalizeCard(t.membercard))?.membercard
      if (foundCard) updatedCard = foundCard.trim()
    }

    if ((!updatedPhone || updatedPhone === '-') && matchingTrx.length > 0) {
      const foundPhone = matchingTrx.find(t => normalizePhone(t.notelp))?.notelp
      if (foundPhone) updatedPhone = foundPhone.trim()
    }

    // Jika poin berbeda atau ada data yang diperbarui, lakukan update
    if (cust.points !== netPoints || cust.membercard !== updatedCard || cust.phone !== updatedPhone) {
      const { error: updateError } = await supabase
        .from('pelanggan')
        .update({
          points: netPoints,
          membercard: updatedCard,
          phone: updatedPhone
        })
        .eq('id', cust.id)

      if (!updateError) {
        customersUpdated++
      }
    }
  }

  // 5. Tangani transaksi yang member-nya belum terdaftar di tabel pelanggan
  const unmatchedTrx = allTrx.filter((_, idx) => !matchedTrxIndices.has(idx))
  
  if (unmatchedTrx.length > 0) {
    // Kelompokkan transaksi yang belum cocok berdasarkan membercard atau phone
    const groupedNewMembers: Record<string, { membercard?: string; notelp?: string; trxs: any[] }> = {}

    unmatchedTrx.forEach(trx => {
      const card = normalizeCard(trx.membercard)
      const phone = normalizePhone(trx.notelp)
      const key = card ? `CARD_${card}` : (phone ? `PHONE_${phone}` : `TRX_${trx.idtransaksi}`)

      if (!groupedNewMembers[key]) {
        groupedNewMembers[key] = {
          membercard: trx.membercard ? String(trx.membercard).trim() : undefined,
          notelp: trx.notelp ? String(trx.notelp).trim() : undefined,
          trxs: []
        }
      }
      groupedNewMembers[key].trxs.push(trx)
    })

    const newCustomersToInsert: any[] = []

    for (const key of Object.keys(groupedNewMembers)) {
      const group = groupedNewMembers[key]
      const netPoints = group.trxs.reduce((sum, trx) => {
        const pts = Number(trx.poin) || 0
        const isPlus = (trx.tipe || 'plus').toLowerCase() === 'plus'
        return isPlus ? sum + pts : sum - pts
      }, 0)

      const cardDisplay = group.membercard || ''
      const phoneDisplay = group.notelp || '-'
      const nameDisplay = cardDisplay ? `Member ${cardDisplay}` : (phoneDisplay !== '-' ? `Pelanggan ${phoneDisplay}` : 'Pelanggan Baru')

      newCustomersToInsert.push({
        name: nameDisplay,
        username: cardDisplay ? cardDisplay.toLowerCase().replace(/[^a-z0-9]/g, '') : null,
        membercard: cardDisplay || null,
        phone: phoneDisplay,
        points: netPoints,
        is_active: true
      })
    }

    if (newCustomersToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('pelanggan')
        .insert(newCustomersToInsert)

      if (!insertError) {
        newCustomersCreated += newCustomersToInsert.length
      } else {
        console.error('Error auto-creating new customers from import:', insertError)
      }
    }
  }

  return {
    totalSynced: customersUpdated + newCustomersCreated,
    newCustomersCreated,
    customersUpdated
  }
}
