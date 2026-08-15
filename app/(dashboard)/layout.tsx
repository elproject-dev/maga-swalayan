"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/toast"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)


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
        // (Cek nomor telepon dihapus)
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
            {isChecking ? <LoadingSpinner text="" /> : children}
          </div>
        </SidebarInset>
        <BottomNavigation />
      </SidebarProvider>


    </>
  )
}
