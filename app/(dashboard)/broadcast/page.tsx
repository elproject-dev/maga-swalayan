"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SendIcon, Upload, Loader2 } from "lucide-react"
import { uploadMedia } from "@/lib/storage"

export default function BroadcastPage() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("File harus berupa gambar")
      return
    }

    setIsUploading(true)
    const toastId = toast.loading("Mengunggah dan mengompres gambar...")

    try {
      const url = await uploadMedia(file, 'images')
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
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body, imageUrl }),
      })

      if (response.ok) {
        toast.success("Broadcast berhasil dikirim!")
        setTitle("")
        setBody("")
        setImageUrl("")
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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kirim Pesan Broadcast</h1>
      </div>

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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setBody(e.target.value)}
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
              <p className="text-xs text-muted-foreground mt-1">Anda bisa memasukkan URL langsung atau klik ikon <b>Unggah</b> di sebelahnya untuk mengunggah gambar baru.</p>
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
    </div>
  )
}
