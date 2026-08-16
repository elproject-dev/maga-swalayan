"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/toast"

export default function LoginPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const checkUser = async () => {
      // Eksekusi cek sesi dan timer 1.5 detik secara paralel
      const [sessionResult] = await Promise.all([
        supabase.auth.getSession(),
        new Promise((resolve) => setTimeout(resolve, 1500)) // Artificial delay 1.5 detik
      ])

      const { data: { session } } = sessionResult

      if (session?.user) {
        router.push("/home")
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkUser()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-24 h-24 animate-pulse flex items-center justify-center">
          <img src="/logo.png" alt="Maga Swalayan Loading" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
      </div>
    )
  }

  const handleOAuthLogin = async (provider: 'google') => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            prompt: 'select_account consent',
          },
        },
      })
      if (error) throw error
    } catch (error: any) {
      toast.add({ title: "Gagal login", description: error.message, type: "error" })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-orange-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-amber-400/10 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6 relative z-10">
        <Card className="w-full aspect-square shadow-2xl border-orange-500/30 flex flex-col justify-center p-6 bg-card/60 backdrop-blur-xl rounded-none transition-all duration-500 hover:border-orange-500/60 hover:shadow-[0_0_40px_-15px_rgba(249,115,22,0.3)]" size="sm">
          <CardHeader className="text-center pb-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 flex items-center justify-center">
                <img src="/logo.png" alt="Maga Swalayan Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Maga Swalayan
                </CardTitle>
                <CardDescription className="text-base">
                  Teman Setia Belanja Anda Disini
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex justify-center pb-4">
            <Button
              variant="outline"
              className="w-full rounded-none border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 transition-all duration-300 group"
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="flex items-center">
                    Memproses
                    <span className="animate-pulse delay-0">.</span>
                    <span className="animate-pulse" style={{ animationDelay: '200ms' }}>.</span>
                    <span className="animate-pulse" style={{ animationDelay: '400ms' }}>.</span>
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Masuk dengan Google
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
