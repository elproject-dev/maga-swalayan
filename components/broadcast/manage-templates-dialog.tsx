"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  SquarePen,
  Save,
  X,
  ShieldAlert,
  Database,
} from "lucide-react"
import {
  PromoTemplate,
  savePromoTemplate,
  deletePromoTemplate,
  getCooldownDays,
  setCooldownDays,
  checkSupabasePromoTableStatus,
} from "@/lib/whatsapp-promo-storage"

interface ManageTemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: PromoTemplate[]
  onTemplatesUpdated: () => void
}

export function ManageTemplatesDialog({
  open,
  onOpenChange,
  templates,
  onTemplatesUpdated,
}: ManageTemplatesDialogProps) {
  const [cooldownDays, setCooldownDaysState] = useState<number>(7)
  const [isEditingCooldown, setIsEditingCooldown] = useState(false)
  const [isTableInSupabase, setIsTableInSupabase] = useState<boolean>(true)

  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [templateForm, setTemplateForm] = useState<{
    id: number
    name: string
    content: string
  }>({ id: 0, name: "", content: "" })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setCooldownDaysState(getCooldownDays())
      checkSupabasePromoTableStatus().then((status) => {
        setIsTableInSupabase(status.templatesTableExists)
      })
    }
  }, [open])

  const handleSaveCooldown = () => {
    const val = Math.max(1, cooldownDays || 1)
    setCooldownDays(val)
    setCooldownDaysState(val)
    setIsEditingCooldown(false)
    toast.success(`Durasi cooldown berhasil disimpan (${val} hari).`)
  }

  const handleOpenAddTemplate = () => {
    setTemplateForm({ id: 0, name: "", content: "" })
    setIsEditingTemplate(true)
  }

  const handleEditTemplate = (t: PromoTemplate) => {
    if (t.id < 0) {
      toast.error("Template bawaan sistem tidak dapat diubah")
      return
    }
    setTemplateForm({ id: t.id, name: t.name, content: t.content })
    setIsEditingTemplate(true)
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      toast.error("Nama dan isi template wajib diisi")
      return
    }

    setIsSaving(true)
    try {
      const res = await savePromoTemplate(templateForm)
      if (res.savedToSupabase) {
        toast.success(
          templateForm.id > 0
            ? "Template berhasil diperbarui di Supabase"
            : "Template baru berhasil ditambahkan ke Supabase"
        )
      } else {
        toast.warning(
          `Tersimpan di browser lokal. Supabase: ${res.errorMessage || "Akses RLS dibatasi."}`
        )
      }
      setIsEditingTemplate(false)
      onTemplatesUpdated()
      // Recheck status
      checkSupabasePromoTableStatus().then((status) => {
        setIsTableInSupabase(status.templatesTableExists)
      })
    } catch {
      toast.error("Gagal menyimpan template")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (id < 0) return
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return

    try {
      const res = await deletePromoTemplate(id)
      if (res.deletedFromSupabase) {
        toast.success("Template berhasil dihapus dari Supabase")
      } else {
        toast.success("Template berhasil dihapus dari penyimpanan lokal")
      }
      onTemplatesUpdated()
    } catch {
      toast.error("Gagal menghapus template")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[96vw] p-0 overflow-hidden flex flex-col max-h-[90vh] h-[85vh]">
        <DialogHeader className="p-4 sm:p-6 border-b border-border space-y-1 bg-background shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-xl font-bold">
            <MessageSquare className="w-5 h-5 text-primary" />
            Kelola Template Pesan & Pengaturan
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Sesuaikan template promosi WhatsApp dan batas waktu pengiriman berulang (*cooldown*).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Supabase Status Alert */}
          {!isTableInSupabase && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-none text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Tabel Database Belum Dibuat di Supabase</div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Tabel <code className="font-mono bg-muted px-1 py-0.5 text-foreground">promo_templates</code> belum ditemukan di Supabase. Data template saat ini tetap aman dan tersimpan di penyimpanan browser lokal.
                </p>
                <p className="text-[11px] text-muted-foreground pt-0.5">
                  👉 Untuk menyimpan ke cloud Supabase, jalankan script <code className="font-mono bg-muted px-1 py-0.5 text-foreground">migrations/create_promo_tables.sql</code> di <strong>Supabase SQL Editor</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Cooldown Settings */}
          <div className="bg-muted/40 p-3 sm:p-4 rounded-none border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Status & Cooldown "Terkirim"
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Pelanggan akan dianggap "Terkirim" selama {cooldownDays} hari ke depan untuk mencegah spam.
                </p>
              </div>
            </div>

            {isEditingCooldown ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={cooldownDays}
                  onChange={(e) => setCooldownDaysState(parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center text-xs px-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveCooldown}
                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingCooldown(true)}
                className="h-8 text-[11px] px-3 shrink-0"
              >
                Ubah Durasi
              </Button>
            )}
          </div>

          {/* Form Tambah/Edit Template */}
          {isEditingTemplate ? (
            <div className="space-y-4 bg-muted/20 p-4 sm:p-5 border-2 border-primary/30 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <SquarePen className="w-4 h-4 text-primary" />
                  {templateForm.id > 0 ? "Edit Template Pesan" : "Tambah Template Baru"}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingTemplate(false)}
                  className="h-7 w-7"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Nama Template
                  </label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, name: e.target.value })
                    }
                    placeholder="Contoh: Promo Diskon Akhir Pekan"
                    className="h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Isi Pesan Template
                  </label>
                  <Textarea
                    value={templateForm.content}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, content: e.target.value })
                    }
                    placeholder="Tulis pesan promosi di sini... Ketik @ untuk nama, # untuk toko, % untuk poin"
                    className="min-h-[140px] text-sm leading-relaxed"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground bg-muted/40 p-2 border border-border">
                    <span><strong className="text-primary font-mono font-bold">@</strong>: Nama Pelanggan</span>
                    <span><strong className="text-primary font-mono font-bold">#</strong>: Maga Swalayan</span>
                    <span><strong className="text-primary font-mono font-bold">%</strong>: Poin Belanja</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTemplate(false)}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveTemplate}
                  disabled={isSaving}
                  className="h-9 px-5 text-xs font-semibold"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Template"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleOpenAddTemplate}
              variant="outline"
              className="w-full gap-2 border-dashed h-11 text-xs sm:text-sm font-semibold"
            >
              <Plus className="w-4 h-4 text-primary" /> Tambah Template Baru
            </Button>
          )}

          {/* List of Templates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Daftar Template Tersedia
              </h4>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-none font-medium">
                {templates.length} Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-card border border-border rounded-none hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between gap-3 min-h-[160px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">
                        {t.name}
                      </span>
                      {t.id < 0 ? (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 font-bold uppercase tracking-wider shrink-0">
                          Sistem
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <Database className="w-2.5 h-2.5" />
                          Kustom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4 leading-relaxed font-sans">
                      {t.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border/50 mt-auto">
                    {t.id > 0 ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(t)}
                          className="h-7 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground border border-border"
                        >
                          <SquarePen className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="h-7 px-3 text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border border-border"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </Button>
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/80 italic">
                        Template bawaan standar
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-muted/30 border-t border-border flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="h-9 px-6 text-xs">
            Selesai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
