"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { SendIcon, Upload, Loader2, Zap, Plus, X, Users, User, Cake, Search, Check } from "lucide-react"
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

  // Target Broadcast State
  const [targetType, setTargetType] = useState<"all" | "personal" | "birthday">("all")
  const [members, setMembers] = useState<any[]>([])
  const [isMembersLoading, setIsMembersLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any | null>(null)
  const [memberSearch, setMemberSearch] = useState("")
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false)

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

  const fetchMembers = useCallback(async () => {
    setIsMembersLoading(true)
    const { data, error } = await supabase
      .from("pelanggan")
      .select("id, name, email, phone, membercard, tanggal_lahir")
      .order("name", { ascending: true })
    if (!error && data) setMembers(data)
    setIsMembersLoading(false)
  }, [])

  useEffect(() => {
    fetchTemplates()
    fetchMembers()
  }, [fetchTemplates, fetchMembers])

  // Member yang berulang tahun hari ini
  const birthdayMembers = useMemo(() => {
    const today = new Date()
    const m = String(today.getMonth() + 1).padStart(2, "0")
    const d = String(today.getDate()).padStart(2, "0")
    const targetSuffix = `-${m}-${d}`

    return members.filter((item) => {
      if (!item.tanggal_lahir) return false
      const str = String(item.tanggal_lahir)
      return str.endsWith(targetSuffix) || str.includes(targetSuffix)
    })
  }, [members])

  // Member yang difilter saat pencarian
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members.slice(0, 6)
    const q = memberSearch.toLowerCase()
    return members
      .filter(
        (m) =>
          (m.name || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q) ||
          (m.phone || "").toLowerCase().includes(q) ||
          (m.membercard || "").toLowerCase().includes(q)
      )
      .slice(0, 10)
  }, [members, memberSearch])

  const handleApplyTemplate = (tpl: Template) => {
    setTitle(tpl.title)
    setBody(tpl.body)
    setActiveTemplate(tpl.id)
  }

  const handleApplyBirthdayGreeting = (m: any) => {
    setSelectedMember(m)
    setTitle(`Selamat Ulang Tahun, ${m.name}! 🎉`)
    setBody(
      `Selamat Ulang Tahun dari Maga Swalayan! Semoga panjang umur, sehat, dan bahagia selalu. Nikmati promo spesial dan bonus poin hari ini untuk Anda di toko kami.`
    )
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
      const url = await uploadMedia(file, "images", true) // JPEG untuk FCM
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

    if (targetType === "personal") {
      if (!selectedMember) {
        toast.error("Silakan pilih 1 member target")
        return
      }
      if (!selectedMember.email) {
        toast.error("Member yang dipilih tidak memiliki email untuk notifikasi")
        return
      }
    }

    if (targetType === "birthday") {
      if (!selectedMember && birthdayMembers.length === 0) {
        toast.error("Tidak ada member yang berulang tahun hari ini")
        return
      }
    }

    setIsLoading(true)

    try {
      const payload: any = {
        title,
        body,
        imageUrl,
        targetType,
      }

      if (targetType === "personal") {
        payload.targetEmail = selectedMember.email
      } else if (targetType === "birthday") {
        if (selectedMember) {
          payload.targetEmail = selectedMember.email
        } else {
          payload.targetEmails = birthdayMembers.map((m) => m.email).filter(Boolean)
        }
      }

      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        if (targetType === "personal" || targetType === "birthday") {
          toast.success(
            `Notifikasi berhasil dikirim ke perangkat ${selectedMember?.name || "member"}! (${result.successCount || 1} perangkat)`
          )
        } else {
          toast.success("Broadcast berhasil dikirim ke semua pengguna!")
        }
        setTitle("")
        setBody("")
        setImageUrl("")
        setSelectedMember(null)
        setActiveTemplate(null)
      } else {
        const error = await response.json()
        toast.error(`Gagal mengirim: ${error.error || "Terjadi kesalahan"}`)
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

      {/* Target Notifikasi */}
      <div className="rounded-none border bg-card text-card-foreground shadow-sm">
        <div className="p-3 border-b flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">Pilih Target Notifikasi</span>
          <span className="text-[11px] text-muted-foreground">Tentukan penerima pesan</span>
        </div>
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setTargetType("all")
                setSelectedMember(null)
              }}
              className={`flex items-start gap-2.5 p-3 border text-left text-xs transition-all ${
                targetType === "all"
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-semibold"
                  : "border-border bg-background text-foreground hover:border-yellow-500/60"
              }`}
            >
              <Users className="h-4 w-4 shrink-0 mt-0.5 text-yellow-500" />
              <div>
                <div className="font-semibold text-xs">Semua Pengguna</div>
                <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                  Broadcast massal ke seluruh perangkat PWA
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTargetType("personal")}
              className={`flex items-start gap-2.5 p-3 border text-left text-xs transition-all ${
                targetType === "personal"
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-semibold"
                  : "border-border bg-background text-foreground hover:border-yellow-500/60"
              }`}
            >
              <User className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
              <div>
                <div className="font-semibold text-xs">Khusus 1 Member</div>
                <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                  Kirim ke 1 akun / email member spesifik
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTargetType("birthday")}
              className={`flex items-start gap-2.5 p-3 border text-left text-xs transition-all ${
                targetType === "birthday"
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-semibold"
                  : "border-border bg-background text-foreground hover:border-yellow-500/60"
              }`}
            >
              <Cake className="h-4 w-4 shrink-0 mt-0.5 text-pink-500" />
              <div>
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  Ulang Tahun Hari Ini
                  {birthdayMembers.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-pink-500 text-white text-[10px] rounded-none">
                      {birthdayMembers.length}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                  Kirim ucapan selamat ulang tahun
                </div>
              </div>
            </button>
          </div>

          {/* Panel Khusus 1 Member */}
          {targetType === "personal" && (
            <div className="mt-4 pt-4 border-t space-y-3 animate-in fade-in duration-300">
              <Label className="text-xs font-semibold">Cari & Pilih Member Target</Label>
              {selectedMember ? (
                <div className="flex items-center justify-between p-3 border border-yellow-500 bg-yellow-500/10 rounded-none text-xs">
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span>{selectedMember.name}</span>
                      {selectedMember.membercard && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30 font-mono">
                          {selectedMember.membercard}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Email: <span className="font-medium text-foreground">{selectedMember.email || "-"}</span> | Telp:{" "}
                      <span className="font-medium text-foreground">{selectedMember.phone || "-"}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setSelectedMember(null)}
                  >
                    Ganti Member
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama, email, no. telp, atau ID member..."
                      value={memberSearch}
                      onChange={(e) => {
                        setMemberSearch(e.target.value)
                        setIsMemberDropdownOpen(true)
                      }}
                      onFocus={() => setIsMemberDropdownOpen(true)}
                      className="text-xs h-9 pr-8"
                    />
                  </div>

                  {isMemberDropdownOpen && (
                    <div className="absolute z-30 mt-1 w-full bg-popover border text-popover-foreground shadow-md max-h-56 overflow-y-auto">
                      {isMembersLoading ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">Memuat member...</div>
                      ) : filteredMembers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">Tidak ada member ditemukan.</div>
                      ) : (
                        filteredMembers.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedMember(m)
                              setIsMemberDropdownOpen(false)
                            }}
                            className="p-2.5 border-b last:border-b-0 hover:bg-accent cursor-pointer text-xs flex justify-between items-center"
                          >
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {m.name}
                                {m.membercard && (
                                  <span className="text-[10px] text-muted-foreground font-mono">({m.membercard})</span>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {m.email || "Tanpa email"} • {m.phone || "Tanpa telp"}
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2">
                              Pilih
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Panel Ulang Tahun Hari Ini */}
          {targetType === "birthday" && (
            <div className="mt-4 pt-4 border-t space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Daftar Member Berulang Tahun Hari Ini</Label>
                {birthdayMembers.length > 0 && !selectedMember && (
                  <span className="text-[11px] text-pink-600 font-medium">
                    {birthdayMembers.length} member berulang tahun
                  </span>
                )}
              </div>

              {birthdayMembers.length === 0 ? (
                <div className="p-4 border bg-muted/20 text-center text-xs text-muted-foreground">
                  🎂 Tidak ada member yang berulang tahun hari ini. Anda juga bisa memilih menu <b>Khusus 1 Member</b>{" "}
                  untuk mengirimkan ucapan secara manual kapan saja.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {birthdayMembers.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2.5 border text-xs flex justify-between items-center transition-all ${
                          selectedMember?.id === m.id
                            ? "border-pink-500 bg-pink-500/10"
                            : "border-border bg-background hover:border-pink-500/50"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {selectedMember?.id === m.id && <Check className="h-3.5 w-3.5 text-pink-500" />}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {m.email || "-"} • Lahir: {m.tanggal_lahir}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={selectedMember?.id === m.id ? "default" : "outline"}
                          className="h-7 text-[11px] px-2.5"
                          onClick={() => handleApplyBirthdayGreeting(m)}
                        >
                          {selectedMember?.id === m.id ? "Terpilih" : "Ucapkan"}
                        </Button>
                      </div>
                    ))}
                  </div>
                  {selectedMember && (
                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                      <span>
                        Mengirim ucapan khusus untuk: <b>{selectedMember.name}</b>
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedMember(null)}
                      >
                        Kirim ke Semua Ulang Tahun
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Template Cepat */}
      <div className="rounded-none border bg-card text-card-foreground shadow-sm">
        <div className="p-3 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-semibold">Template Cepat</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">— Klik untuk mengisi form secara otomatis</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs px-2 sm:px-3"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Tambah Template</span>
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
                  className={`group relative rounded-none border text-xs font-medium transition-all cursor-pointer ${
                    activeTemplate === tpl.id
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
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingId(tpl.id)
                    }}
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
              <Label htmlFor="title" className="text-xs sm:text-sm">
                Judul Notifikasi
              </Label>
              <Input
                id="title"
                className="text-xs sm:text-sm h-9 sm:h-10"
                placeholder="Masukkan Judul Notifikasi"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setActiveTemplate(null)
                }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="body" className="text-xs sm:text-sm">
                Isi Pesan
              </Label>
              <Textarea
                id="body"
                className="text-xs sm:text-sm min-h-[100px] sm:min-h-[120px]"
                placeholder="Tuliskan pesan broadcast Anda di sini..."
                rows={4}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value)
                  setActiveTemplate(null)
                }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="imageUrl" className="text-xs sm:text-sm">
                URL Gambar Banner (Opsional)
              </Label>
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
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Anda bisa memasukkan URL langsung atau klik ikon <b>Unggah</b> di sebelahnya untuk mengunggah gambar baru.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
              {isLoading ? (
                "Mengirim..."
              ) : (
                <>
                  <SendIcon className="mr-2 h-4 w-4" />
                  {targetType === "all"
                    ? "Kirim Broadcast Massal"
                    : targetType === "personal"
                    ? `Kirim ke ${selectedMember?.name || "1 Member"}`
                    : `Kirim Ucapan Ulang Tahun${selectedMember ? ` ke ${selectedMember.name}` : ""}`}
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
      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
      >
        <DialogContent className="sm:max-w-sm rounded-none">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">Hapus Template</DialogTitle>
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
