"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SunIcon, Loader2, MailCheckIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/toast"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isSignupSuccess, setIsSignupSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        toast.add({ title: "Login berhasil", type: "success" })
        router.push("/home")
      } else {
        // Sign Up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
            },
            emailRedirectTo: `${window.location.origin}/home`,
          }
        })
        if (error) throw error
        
        // Menampilkan pesan sukses periksa email (Kareba template email bawaan berupa Link)
        setIsSignupSuccess(true)
      }
    } catch (error: any) {
      toast.add({ title: "Gagal", description: error.message, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google') => {
    try {
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
    }
  }

  // Jika pendaftaran berhasil dan menunggu konfirmasi email
  if (isSignupSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-sm shadow-lg border-primary/10 text-center py-6">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
              <MailCheckIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Cek Email Anda</CardTitle>
            <CardDescription className="text-base mt-2">
              Kami telah mengirimkan tautan konfirmasi ke <strong>{email}</strong>. Silakan klik tautan tersebut untuk mengaktifkan akun Anda.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setIsSignupSuccess(false)}>
              Kembali ke Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Card className="w-full shadow-lg border-primary/10">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-primary p-3 rounded-xl text-primary-foreground shadow-md">
                <SunIcon className="w-5 h-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                {isLogin ? "Maga Swalayan" : "Buat Akun Baru"}
              </CardTitle>
            </div>
            <CardDescription>
              {isLogin
                ? "Masukkan email dan password Anda untuk masuk."
                : "Daftarkan diri Anda untuk menikmati promo khusus."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form id="auth-form" className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Budi Santoso"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">No. WhatsApp / Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                      Lupa password?
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" form="auth-form" disabled={isLoading} className="w-full text-md font-semibold">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Masuk" : "Daftar Sekarang"}
            </Button>

            <div className="flex w-full items-center gap-2">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-xs text-muted-foreground uppercase">Atau</span>
              <div className="h-px flex-1 bg-border"></div>
            </div>

            <Button variant="outline" className="w-full" type="button" onClick={() => handleOAuthLogin('google')}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </Button>

            <div className="mt-2 text-center text-sm text-muted-foreground">
              {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                {isLogin ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
