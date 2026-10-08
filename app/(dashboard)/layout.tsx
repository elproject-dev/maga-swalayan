"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { TopBar } from "@/components/top-bar"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/toast"
import { LoadingSpinner } from "@/components/loading-spinner"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingRole, setIsCheckingRole] = useState(true)

  useEffect(() => {
    // Cek apakah ada error di URL (seperti saat user membatalkan login)
    if (window.location.hash.includes("error=access_denied") || window.location.search.includes("error=access_denied")) {
      toast.add({ title: "Akses Ditolak", description: "Anda membatalkan proses login.", type: "error" })
      router.replace("/")
      return
    }

    // Cek sesi yang ada untuk menentukan antarmuka (TopBar vs Sidebar)
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.email) {
         const email = session.user.email
         if (email === "elproject.dev@gmail.com") {
           setIsAdmin(true)
         } else {
           const { data: staffData } = await supabase.from('staf').select('id').eq('email', email).maybeSingle()
           if (staffData) setIsAdmin(true)
         }
      }
      setIsCheckingRole(false)
    }

    checkAuthAndRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (!session?.user) {
         setIsAdmin(false)
       }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (!isCheckingRole && !isAdmin) {
      const publicRoutes = ['/home', '/promo', '/event', '/produk', '/member', '/lokasi']
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
      
      if (!isPublicRoute) {
        toast.add({ title: "Akses Ditolak", description: "Anda tidak memiliki izin mengakses halaman tersebut.", type: "error" })
        router.replace('/home')
      }
    }
  }, [isCheckingRole, isAdmin, pathname, router])

  if (isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <LoadingSpinner text="Memuat antarmuka..." />
      </div>
    )
  }

  if (isAdmin) {
    return (
      <>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 65)",
              "--header-height": "calc(var(--spacing) * 10)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col pb-16 lg:pb-0">
              {children}
            </div>
          </SidebarInset>
          <BottomNavigation />
        </SidebarProvider>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col min-h-screen w-full bg-[#FDFDFD] dark:bg-zinc-950 transition-colors">
        <div className="w-full shrink-0 z-50 sticky top-0">
          <TopBar />
        </div>
        <div className="flex flex-1 flex-col pb-16 lg:pb-0">
          {children}
        </div>
        <BottomNavigation />
      </div>
    </>
  )
}
