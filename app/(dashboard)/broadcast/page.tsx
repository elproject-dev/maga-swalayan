"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SendIcon } from "lucide-react"

export default function BroadcastPage() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Kirim Pesan Broadcast</h1>
      </div>

      <div className="rounded-none border bg-card text-card-foreground shadow-sm">
        <div className="p-4 md:p-6">
          <form onSubmit={handleSendBroadcast} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Notifikasi</Label>
              <Input
                id="title"
                placeholder="Masukkan Judul Notifikasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Isi Pesan</Label>
              <Textarea
                id="body"
                placeholder="Tuliskan pesan broadcast Anda di sini..."
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL Gambar Banner (Opsional)</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="Masukkan URL Gambar Banner"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">Gambar ini akan muncul besar di dalam notifikasi.</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
