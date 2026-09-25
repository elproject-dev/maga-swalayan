"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { SendIcon, Upload, Loader2, Zap, Plus, Trash2, X } from "lucide-react"
import { uploadMedia } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

type Template = {
  id: number
  label: string
  title: string
  body: string
}

export default function BroadcastPage() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Template state
  const [templates, setTemplates] = useState<Template[]>([])
  const [isTemplateLoading, setIsTemplateLoading] = useState(true)
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null)

  // Add Template Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTemplates = useCallback(async () => {
    setIsTemplateLoading(true)
    const { data, error } = await supabase
      .from("broadcast_templates")
      .select("*")
      .order("created_at", { ascending: true })
    if (!error && data) setTemplates(data)
    setIsTemplateLoading(false)
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleApplyTemplate = (tpl: Template) => {
    setTitle(tpl.title)
    setBody(tpl.body)
    setActiveTemplate(tpl.id)
  }

  const handleSaveTemplate = async () => {
    if (!newLabel.trim() || !newTitle.trim() || !newBody.trim()) {
      toast.error("Semua kolom wajib diisi")
      return
    }
    setIsSavingTemplate(true)
    const { error } = await supabase.from("broadcast_templates").insert({
      label: newLabel.trim(),
      title: newTitle.trim(),
      body: newBody.trim(),
    })
    if (error) {
      toast.error("Gagal menyimpan template")
    } else {
      toast.success("Template berhasil ditambahkan!")
      setNewLabel("")
      setNewTitle("")
      setNewBody("")
      setIsAddDialogOpen(false)
      fetchTemplates()
    }
    setIsSavingTemplate(false)
  }

  const handleDeleteTemplate = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    const { error } = await supabase.from("broadcast_templates").delete().eq("id", deletingId)
    if (error) {
      toast.error("Gagal menghapus template")
    } else {
      toast.success("Template berhasil dihapus")
      if (activeTemplate === deletingId) setActiveTemplate(null)
      fetchTemplates()
    }
    setDeletingId(null)
    setIsDeleting(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar")
      return
    }

    setIsUploading(true)
    const toastId = toast.loading("Mengunggah dan mengompres gambar...")

    try {
      const url = await uploadMedia(file, "images")
      if (url) {
        toast.success("Gambar berhasil diunggah!", { id: toastId })
        setImageUrl(url)
      } else {
        toast.error("Gagal mengunggah gambar", { id: toastId })
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan saat unggah", { id: toastId })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !body) {
      toast.error("Judul dan pesan tidak boleh kosong")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, imageUrl }),
      })

      if (response.ok) {
        toast.success("Broadcast berhasil dikirim!")
        setTitle("")
        setBody("")
        setImageUrl("")
        setActiveTemplate(null)
      } else {
        const error = await response.json()
        toast.error(`Gagal mengirim: ${error.error || "Unknown error"}`)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim broadcast")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-md sm:text-xl font-bold tracking-tight">Kirim Pesan Broadcast</h1>
      </div>

      {/* Template Cepat */}
      <div className="rounded-none border bg-card text-card-foreground shadow-sm">
        <div className="p-3 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-semibold">Template Cepat</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">— Klik untuk mengisi form secara otomatis</span>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-3 w-3" />
            Tambah Template
          </Button>
        </div>

        <div className="p-3">
          {isTemplateLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Belum ada template. Klik <b>Tambah Template</b> untuk membuat yang baru.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`group relative rounded-none border text-xs font-medium transition-all cursor-pointer ${activeTemplate === tpl.id
                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-600"
                    : "border-border bg-background text-foreground hover:border-yellow-500/60 hover:text-yellow-600"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="w-full text-left px-3 py-2.5 pr-7"
                  >
                    {tpl.label}
                  </button>
                  <button
                    type="button"
                    title="Hapus template"
                    onClick={(e) => { e.stopPropagation(); setDeletingId(tpl.id) }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded-sm text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-none border bg-card text-card-foreground shadow-sm">
        <div className="p-4 md:p-6">
          <form onSubmit={handleSendBroadcast} className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">Judul Notifikasi</Label>
              <Input
                id="title"
                className="text-xs sm:text-sm h-9 sm:h-10"
                placeholder="Masukkan Judul Notifikasi"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setActiveTemplate(null) }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="body" className="text-xs sm:text-sm">Isi Pesan</Label>
              <Textarea
                id="body"
                className="text-xs sm:text-sm min-h-[100px] sm:min-h-[120px]"
                placeholder="Tuliskan pesan broadcast Anda di sini..."
                rows={4}
                value={body}
                onChange={(e) => { setBody(e.target.value); setActiveTemplate(null) }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="imageUrl" className="text-xs sm:text-sm">URL Gambar Banner (Opsional)</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  type="url"
                  className="text-xs sm:text-sm h-9 sm:h-10 flex-1"
                  placeholder="Masukkan URL Gambar Banner"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isLoading}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-9 sm:h-10 sm:w-10 px-0 shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isLoading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Anda bisa memasukkan URL langsung atau klik ikon <b>Unggah</b> di sebelahnya untuk mengunggah gambar baru.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
              {isLoading ? "Mengirim..." : (
                <>
                  <SendIcon className="mr-2 h-4 w-4" />
                  Kirim Sekarang
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Dialog Tambah Template */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-sm">Tambah Template Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Isi informasi template broadcast yang akan disimpan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Label Template</Label>
              <Input
                placeholder="contoh : Promo Merdeka"
                className="h-8 text-xs"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                disabled={isSavingTemplate}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Judul Notifikasi</Label>
              <Input
                placeholder="Masukkan judul notifikasi..."
                className="h-8 text-xs"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={isSavingTemplate}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Isi Pesan</Label>
              <Textarea
                placeholder="Tuliskan isi pesan broadcast..."
                className="text-xs min-h-[80px]"
                rows={3}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                disabled={isSavingTemplate}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)} disabled={isSavingTemplate}>
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveTemplate} disabled={isSavingTemplate}>
              {isSavingTemplate ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <DialogContent className="sm:max-w-sm rounded-none">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">

              Hapus Template
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus template ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingId(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteTemplate} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
