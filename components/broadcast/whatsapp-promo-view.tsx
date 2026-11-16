"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { normalizeCard, normalizePhone } from "@/lib/poin-sync"
import {
  formatWhatsAppPhone,
  formatWhatsAppMessage,
  generateWhatsAppLink,
  checkIsSentWithinCooldown,
} from "@/lib/whatsapp-promo-utils"
import {
  PromoTemplate,
  DEFAULT_PROMO_TEMPLATES,
  getPromoTemplates,
  getSentLogs,
  recordSentLog,
  resetSentLogs,
  getCooldownDays,
} from "@/lib/whatsapp-promo-storage"
import { ManageTemplatesDialog } from "@/components/broadcast/manage-templates-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  Search,
  MessageSquare,
  Send,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  User,
  Users,
} from "lucide-react"

interface CustomerRecord {
  id: number
  name: string
  phone: string
  email?: string
  membercard?: string
  points: number
  created_at?: string
  membership_type?: string
}

const ITEMS_PER_PAGE = 15
const STORE_NAME = "Maga Swalayan"

export function WhatsAppPromoView() {
  const [search, setSearch] = useState("")
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Template states
  const [templates, setTemplates] = useState<PromoTemplate[]>(DEFAULT_PROMO_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<PromoTemplate>(DEFAULT_PROMO_TEMPLATES[0])
  const [customMessage, setCustomMessage] = useState<string>(DEFAULT_PROMO_TEMPLATES[0].content)
  const [isManagingTemplates, setIsManagingTemplates] = useState(false)

  // Sent logs & cooldown
  const [sentLogs, setSentLogs] = useState<Map<number, string>>(new Map())
  const [cooldownDays, setCooldownDays] = useState<number>(7)
  const [statusFilter, setStatusFilter] = useState<"all" | "sent" | "unsent">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(15)

  // 1. Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const data = await getPromoTemplates()
      setTemplates(data)
      if (data.length > 0) {
        setSelectedTemplate((prev) => {
          const exists = data.find((t) => t.id === prev?.id)
          return exists || data[0]
        })
        setCustomMessage((prev) => (prev ? prev : data[0].content))
      }
    } catch {
      setTemplates(DEFAULT_PROMO_TEMPLATES)
    }
  }, [])

  // 2. Fetch sent logs
  const fetchLogs = useCallback(async () => {
    try {
      const logs = await getSentLogs()
      setSentLogs(logs)
      setCooldownDays(getCooldownDays())
    } catch (err) {
      console.error("Gagal mengambil sent logs:", err)
    }
  }, [])

  // 3. Fetch customers and calculate real points from transactions
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: custList, error: custErr } = await supabase
        .from("pelanggan")
        .select("*")
        .order("id", { ascending: false })

      if (custErr) throw custErr

      const { data: poinData } = await supabase
        .from("poin_transactions")
        .select("membercard, notelp, poin, tipe")

      const pointsByCard: Record<string, number> = {}
      const pointsByPhone: Record<string, number> = {}

      if (poinData) {
        poinData.forEach((trx: any) => {
          const p = Number(trx.poin) || 0
          const isPlus = (trx.tipe || "plus").toLowerCase() === "plus"
          const delta = isPlus ? p : -p

          const card = normalizeCard(trx.membercard)
          if (card) {
            pointsByCard[card] = (pointsByCard[card] || 0) + delta
          }
          const phone = normalizePhone(trx.notelp)
          if (phone) {
            pointsByPhone[phone] = (pointsByPhone[phone] || 0) + delta
          }
        })
      }

      // Filter hanya data yang sudah memiliki nomor membercard (sama persis dengan Database Member)
      const memberOnlyList = (custList || []).filter(
        (item: any) => item.membercard && item.membercard.trim() !== "" && item.membercard.trim() !== "-"
      )

      const formatted = memberOnlyList.map((item: any) => {
        const card = normalizeCard(item.membercard)
        const phone = normalizePhone(item.phone)
        let pts = item.points || 0

        if (card && pointsByCard[card] !== undefined) {
          pts = pointsByCard[card]
        } else if (phone && pointsByPhone[phone] !== undefined) {
          pts = pointsByPhone[phone]
        }

        return {
          id: item.id,
          name: item.name || "Member",
          phone: item.phone || "",
          email: item.email || "",
          membercard: item.membercard || "",
          points: pts,
          created_at: item.created_at || "",
          membership_type: "member",
        }
      })

      setCustomers(formatted)
    } catch (err) {
      console.error("Gagal mengambil data pelanggan:", err)
      toast.error("Gagal memuat data member")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
    fetchLogs()
    fetchCustomers()
  }, [fetchTemplates, fetchLogs, fetchCustomers])

  const handleTemplateChange = (templateIdStr: string) => {
    const tid = parseInt(templateIdStr, 10)
    const tpl = templates.find((t) => t.id === tid)
    if (tpl) {
      setSelectedTemplate(tpl)
      setCustomMessage(tpl.content)
    }
  }

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim()

    const list = customers.filter((c) => {
      const validPhone = formatWhatsAppPhone(c.phone)
      if (!validPhone) return false

      const hasMemberCard = Boolean(c.membercard && c.membercard.trim() !== "" && c.membercard.trim() !== "-")
      if (!hasMemberCard) return false

      const matchSearch =
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        (c.membercard && c.membercard.toLowerCase().includes(query))

      if (!matchSearch) return false

      const lastSent = sentLogs.get(c.id)
      const isSent = checkIsSentWithinCooldown(lastSent, cooldownDays)

      if (statusFilter === "sent") return isSent
      if (statusFilter === "unsent") return !isSent

      return true
    })

    return list.sort((a, b) => {
      if (sortOrder === "newest") return b.id - a.id
      return a.id - b.id
    })
  }, [customers, search, sentLogs, cooldownDays, statusFilter, sortOrder])

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  // Single customer send
  const handleSendWA = async (customer: CustomerRecord) => {
    const formattedPhone = formatWhatsAppPhone(customer.phone)
    if (!formattedPhone) {
      toast.error("Nomor WhatsApp member tidak valid")
      return
    }

    const message = formatWhatsAppMessage(customMessage, {
      name: customer.name,
      storeName: STORE_NAME,
      points: customer.points,
    })

    const link = generateWhatsAppLink(formattedPhone, message)
    window.open(link, "_blank", "noopener,noreferrer")

    toast.success(`Membuka WhatsApp untuk ${customer.name}`)

    // Update sentLogs locally
    const nowIso = new Date().toISOString()
    setSentLogs((prev) => {
      const updated = new Map(prev)
      updated.set(customer.id, nowIso)
      return updated
    })

    // Record to storage
    await recordSentLog(customer.id, selectedTemplate?.id)
  }

  const handleResetLogs = async () => {
    if (
      !confirm(
        "Reset semua status pengiriman promo? Semua member akan kembali berstatus 'Belum Dikirim'."
      )
    ) {
      return
    }

    await resetSentLogs()
    setSentLogs(new Map())
    toast.success("Riwayat pengiriman berhasil direset")
  }

  // Helper for rendering live preview with bold formatting
  const renderPreviewMessage = (text: string) => {
    const formatted = formatWhatsAppMessage(text, {
      name: "Budi Santoso",
      storeName: STORE_NAME,
      points: 250,
    })

    return formatted.split(/(\*[^*]+\*)/g).map((part, i) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <strong key={i} className="font-bold text-foreground">
            {part.slice(1, -1)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Config & Preview */}
        <div className="lg:col-span-1 space-y-5">
          <Card className="p-4 sm:p-5 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Konfigurasi Pesan Promo
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManagingTemplates(true)}
                className="h-7 text-[11px] gap-1 px-2.5"
              >
                Kelola Template
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Pilih Template
                </label>
                <select
                  className="w-full h-9 px-3 bg-background border border-border rounded-none text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedTemplate?.id || ""}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.id < 0 ? "(Standar)" : "(Kustom)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Isi Pesan Promosi
                </label>
                <Textarea
                  className="min-h-[170px] text-xs sm:text-sm leading-relaxed resize-none"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Tulis pesan promosi di sini..."
                />
                <div className="mt-2 space-y-1 bg-muted/40 p-2 border border-border text-[11px] text-muted-foreground">
                  <div>
                    <span className="font-mono text-primary font-bold">@</span> = Nama Member
                  </div>
                  <div>
                    <span className="font-mono text-primary font-bold">#</span> = Nama Toko ({STORE_NAME})
                  </div>
                  <div>
                    <span className="font-mono text-primary font-bold">%</span> = Jumlah Poin Belanja
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Live Preview Box */}
          <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live Preview WhatsApp
              </h4>
              <span className="text-[9px] text-muted-foreground">Contoh simulasi</span>
            </div>
            <div className="bg-background p-3.5 border border-border text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap shadow-inner rounded-none">
              {renderPreviewMessage(customMessage)}
            </div>
          </Card>
        </div>

        {/* Right Column: Customer List & Actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Controls: Search, Filter, Sort, Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari nama, nomor WhatsApp, atau nomor member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-xs sm:text-sm bg-background border-border"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Filter status */}
              <div className="flex bg-muted p-0.5 border border-border shrink-0">
                {(
                  [
                    { id: "all", label: "Semua" },
                    { id: "unsent", label: "Belum" },
                    { id: "sent", label: "Terkirim" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStatusFilter(opt.id)}
                    className={`px-2.5 h-8 text-[11px] font-semibold transition-all ${
                      statusFilter === opt.id
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort order */}
              <div className="flex bg-muted p-0.5 border border-border shrink-0">
                {(
                  [
                    { id: "newest", label: "Terbaru" },
                    { id: "oldest", label: "Terlama" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortOrder(opt.id)}
                    className={`px-2.5 h-8 text-[11px] font-semibold transition-all ${
                      sortOrder === opt.id
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Reset Logs */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetLogs}
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-500 hover:border-red-300"
                title="Reset Status Pengiriman"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-card border border-border rounded-none overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-10 text-center text-xs">No</TableHead>
                  <TableHead className="text-xs">Nama Member</TableHead>
                  <TableHead className="hidden md:table-cell text-xs">No. Member</TableHead>
                  <TableHead className="text-xs">WhatsApp</TableHead>
                  <TableHead className="text-center text-xs">Poin</TableHead>
                  <TableHead className="text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-xs">
                      Memuat data member dan poin...
                    </TableCell>
                  </TableRow>
                ) : paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-xs">
                      Tidak ada member yang cocok dengan pencarian atau filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer, idx) => {
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1
                    const isSent = checkIsSentWithinCooldown(sentLogs.get(customer.id), cooldownDays)

                    return (
                      <TableRow key={customer.id} className="hover:bg-muted/30">
                        <TableCell className="text-center text-xs text-muted-foreground font-mono">
                          {rowNumber}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                            {customer.name}
                          </div>
                          {customer.membercard && (
                            <span className="text-[10px] text-muted-foreground font-mono md:hidden">
                              Card: {customer.membercard}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs font-mono">
                          <span className="px-2 py-0.5 text-[11px] bg-primary/10 text-primary font-semibold">
                            {customer.membercard}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {customer.phone || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-xs text-primary font-mono">
                            {customer.points.toLocaleString("id-ID")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isSent ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="h-8 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-500/5 cursor-default gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Terkirim</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleSendWA(customer)}
                              className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Kirim WA</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground w-full sm:w-auto justify-between sm:justify-start">
                <span>
                  Menampilkan {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, filteredCustomers.length)} dari{" "}
                  {filteredCustomers.length.toLocaleString("id-ID")} member
                </span>
                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="hidden sm:inline">Per halaman:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="bg-background border border-border px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>

                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - currentPage) <= 1
                      )
                      .map((page, index, arr) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && arr[index - 1] !== page - 1 && (
                            <span className="px-1 text-muted-foreground text-xs">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`h-7 w-7 text-xs font-semibold ${
                              currentPage === page
                                ? "bg-primary text-primary-foreground font-bold"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manage Templates Dialog */}
      <ManageTemplatesDialog
        open={isManagingTemplates}
        onOpenChange={(open) => {
          setIsManagingTemplates(open)
          if (!open) setCooldownDays(getCooldownDays())
        }}
        templates={templates}
        onTemplatesUpdated={() => {
          fetchTemplates()
          setCooldownDays(getCooldownDays())
        }}
      />
    </div>
  )
}
