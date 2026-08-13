"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PhoneIcon } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  // State untuk Modal Lengkapi Profil
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneInput, setPhoneInput] = useState("")
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false)

  useEffect(() => {
    // Cek apakah ada error di URL (seperti saat user membatalkan login)
    if (window.location.hash.includes("error=access_denied") || window.location.search.includes("error=access_denied")) {
      toast.add({ title: "Akses Ditolak", description: "Anda membatalkan proses login.", type: "error" })
      router.replace("/")
      return
    }

    // Cek sesi yang ada untuk memproteksi halaman
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace("/")
      } else {
        // Cek apakah nomor telepon pengguna kosong
        if (!session.user.user_metadata?.phone) {
          setShowPhoneModal(true)
        }
        setIsChecking(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Hanya redirect ke login jika secara eksplisit eventnya SIGNED_OUT atau USER_DELETED.
      // Jika eventnya INITIAL_SESSION dan session null (karena delay baca localStorage), kita biarkan checkAuth yang menangani.
      if (event === 'SIGNED_OUT') {
        router.replace("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneInput) return

    setIsSubmittingPhone(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { phone: phoneInput }
      })

      if (error) throw error

      toast.add({ title: "Berhasil", description: "Nomor telepon Anda berhasil disimpan.", type: "success" })
      setShowPhoneModal(false)
    } catch (error: any) {
      toast.add({ title: "Gagal", description: error.message, type: "error" })
    } finally {
      setIsSubmittingPhone(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col pb-16 md:pb-0">
            {children}
          </div>
        </SidebarInset>
        <BottomNavigation />
      </SidebarProvider>

      {/* Modal Lengkapi Profil (Nomor Telepon) */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-xl border-primary/20">
            <CardHeader className="text-center pb-4">
              <div>
                <div className="h-24 w-24 p-4 rounded-full mb-4 inline-flex items-center justify-center">
                  <img src="/phone.png" alt="Phone Icon" />
                </div>
              </div>



              <CardTitle className="text-2xl font-bold">Lengkapi Profil Anda</CardTitle>
              <CardDescription className="text-base mt-2">
                Mohon isi No.Telp terdaftar untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="phone-form" onSubmit={handleSavePhone} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-modal-input">No. WhatsApp / Telepon</Label>
                  <Input
                    id="phone-modal-input"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    required
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="phone-form" disabled={isSubmittingPhone || !phoneInput} className="w-full text-md font-semibold">
                {isSubmittingPhone && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Nomor Telepon
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
