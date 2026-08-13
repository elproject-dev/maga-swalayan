"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { uploadAvatar } from "@/lib/storage"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera, Phone, Lock, Save } from "lucide-react"

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(true)

  // States for user data
  const [userId, setUserId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userFullName, setUserFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  // States for forms
  const [phone, setPhone] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        setUserEmail(session.user.email || "")
        setUserFullName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "")
        setPhone(session.user.user_metadata?.phone || "")
        setAvatarUrl(session.user.user_metadata?.avatar_url || "")
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  const compressToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          // Batas maksimal dimensi agar file ringan
          const MAX_SIZE = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Canvas not supported"))

          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error("Kompresi gagal"))
            },
            "image/webp",
            0.8 // 80% kualitas
          )
        }
        img.onerror = (err) => reject(err)
      }
      reader.onerror = (err) => reject(err)
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    // Tampilkan preview lokal segera agar tidak ada kedipan/flashback teks
    const previewUrl = URL.createObjectURL(file)
    const oldUrl = avatarUrl
    setAvatarUrl(previewUrl)

    setIsUpdatingAvatar(true)
    try {
      // 0. Kompresi gambar menjadi WebP
      const webpBlob = await compressToWebP(file)

      // 1. Upload gambar ke storage (otomatis menimpa yang lama karena upsert: true dan nama yang sama)
      const uploadedUrl = await uploadAvatar(webpBlob, userId)

      if (!uploadedUrl) {
        throw new Error("Gagal mengunggah gambar. Pastikan bucket 'media' publik sudah tersedia.")
      }

      // 2. Update user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: uploadedUrl }
      })

      if (error) throw error

      // Kita tidak menjalankan setAvatarUrl(uploadedUrl) di sini.
      // Kita biarkan avatarUrl tetap menggunakan 'previewUrl' lokal
      // agar browser tidak mengalami kedipan (flashback teks) saat mengunduh dari server.
      toast.add({ title: "Berhasil", description: "Foto profil berhasil diperbarui", type: "success" })
    } catch (error: any) {
      setAvatarUrl(oldUrl) // Kembalikan ke foto lama jika gagal
      URL.revokeObjectURL(previewUrl) // Bersihkan memori preview karena tidak jadi dipakai
      toast.add({ title: "Gagal", description: error.message, type: "error" })
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPhone(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { phone: phone }
      })

      if (error) throw error
      toast.add({ title: "Berhasil", description: "Nomor telepon berhasil diperbarui", type: "success" })
    } catch (error: any) {
      toast.add({ title: "Gagal", description: error.message, type: "error" })
    } finally {
      setIsUpdatingPhone(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.add({ title: "Peringatan", description: "Kata sandi minimal 6 karakter", type: "warning" })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      toast.add({ title: "Berhasil", description: "Kata sandi berhasil diperbarui", type: "success" })
      setNewPassword("")
    } catch (error: any) {
      toast.add({ title: "Gagal", description: error.message, type: "error" })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Pengaturan Akun</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="col-span-1 lg:col-span-1 border-primary/10 shadow-md">
          <CardHeader>
            <CardTitle>Foto Profil</CardTitle>

          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32 rounded-full border-4 border-muted">
                <AvatarImage src={avatarUrl || "/boy.png"} alt="Avatar" />
                <AvatarFallback className="text-4xl">{userFullName.substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
              </Avatar>
              {isUpdatingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full backdrop-blur-[2px] z-10 border-4 border-transparent">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{userFullName || "Pengguna"}</h3>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUpdatingAvatar}
            >
              {isUpdatingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              {isUpdatingAvatar ? "Mengunggah..." : "Ubah Foto"}
            </Button>
          </CardContent>
        </Card>

        <div className="col-span-1 lg:col-span-2 space-y-4">
          {/* Phone Card */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">

                Nomor Telepon
              </CardTitle>
              <CardDescription>Perbarui nomor WhatsApp / Telepon Anda yang dapat dihubungi.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePhone}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className="w-1/2" disabled={isUpdatingPhone}>
                    {isUpdatingPhone ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Nomor
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>

          {/* Password Card */}
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">

                Kata Sandi
              </CardTitle>
              <CardDescription>
                Ubah kata sandi akun Anda. Pengguna Google Login mungkin harus membuat sandi baru jika ingin login dengan Email.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Kata Sandi Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className="w-1/2" disabled={isUpdatingPassword || !newPassword}>
                    {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Ganti Kata Sandi
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
