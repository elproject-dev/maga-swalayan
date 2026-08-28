"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SendIcon, BellRingIcon } from "lucide-react"

export default function BroadcastPage() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
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
        body: JSON.stringify({ title, body }),
      })

      if (response.ok) {
        toast.success("Broadcast berhasil dikirim!")
        setTitle("")
        setBody("")
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BellRingIcon className="h-8 w-8 text-primary" />
          Kirim Broadcast Notifikasi
        </h2>
      </div>

      <div className="max-w-2xl mt-8">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Kirim Pesan Masal</h3>
            <p className="text-sm text-muted-foreground">
              Pesan ini akan dikirimkan ke semua perangkat pengguna yang telah mengizinkan notifikasi aplikasi.
            </p>
          </div>
          <div className="p-6 pt-0">
            <form onSubmit={handleSendBroadcast} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Notifikasi</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Promo Spesial Weekend!"
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
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={isLoading}
                />
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
    </div>
  )
}
