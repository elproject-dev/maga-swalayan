"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Loader2, Mail, Phone, User, CreditCard, Award, MapPin, Calendar, Hash, ShoppingCart, Gift, Star, Percent, Sparkles } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface MemberData {
  name: string
  email: string
  phone: string
  points: number
  isMember: boolean
  alamat: string
  kecamatan: string
  kabupaten: string
  tanggalLahir: string
  membercard: string
}

export default function MemberPage() {
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [regPhone, setRegPhone] = useState("")
  const [regAlamat, setRegAlamat] = useState("")
  const [regKecamatan, setRegKecamatan] = useState("")
  const [regKabupaten, setRegKabupaten] = useState("")
  const [regTanggalLahir, setRegTanggalLahir] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // 1. Cek apakah nomor telepon sudah ada di poin_transactions untuk mengambil membercard lama
      const { data: poinData } = await supabase
        .from('poin_transactions')
        .select('membercard')
        .eq('notelp', regPhone)
        .limit(1)

      let newId = ""
      if (poinData && poinData.length > 0 && poinData[0].membercard) {
        // Jika sudah ada histori transaksi, gunakan ID lama
        newId = poinData[0].membercard
      } else {
        // Jika tidak ada histori, generate ID baru
        const { data: latestMembers, error: fetchError } = await supabase
          .from('pelanggan')
          .select('membercard')
          .like('membercard', 'MG-SW%')
          .order('membercard', { ascending: false })
          .limit(1)

        if (fetchError) throw fetchError

        newId = "MG-SW000001"
        if (latestMembers && latestMembers.length > 0 && latestMembers[0].membercard) {
          const lastId = latestMembers[0].membercard
          const lastNumber = parseInt(lastId.replace("MG-SW", ""), 10)
          if (!isNaN(lastNumber)) {
            newId = `MG-SW${String(lastNumber + 1).padStart(6, '0')}`
          }
        }
      }

      // 2. Insert/Update into pelanggan
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("Anda harus login")
      const userEmail = session.user.email || ""
      const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0]

      const { data: existing } = await supabase.from('pelanggan').select('id').eq('email', userEmail).limit(1)

      const payload = {
        name: userName,
        email: userEmail,
        phone: regPhone,
        alamat: regAlamat,
        kecamatan: regKecamatan,
        kabupaten: regKabupaten,
        tanggal_lahir: regTanggalLahir || null,
        membercard: newId,
        is_active: true,
        points: 0
      }

      if (existing && existing.length > 0) {
        const { error } = await supabase.from('pelanggan').update(payload).eq('email', userEmail)
        if (error) throw error
      } else {
        const { error } = await supabase.from('pelanggan').insert([payload])
        if (error) throw error
      }

      toast.add({ title: "Berhasil", description: `Member berhasil didaftarkan dengan ID: ${newId}`, type: "success" })

      setIsRegisterModalOpen(false)
      // Reload halaman agar data poin lama langsung terambil dari database
      window.location.reload()

    } catch (error: any) {
      toast.add({ title: "Gagal Mendaftar", description: error.message, type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setIsLoading(true)

        // 1. Dapatkan user session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        const userEmail = session.user.email || ""
        let userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0]
        let userPhone = session.user.phone || ""
        let userPoints = 0
        let userIsMember = false
        let memberCardId = "-"

        // 2. Jika tidak ada phone dari session, coba cari dari tabel pelanggan
        let userAlamat = "-"
        let userKecamatan = "-"
        let userKabupaten = "-"
        let userTanggalLahir = "-"

        if (userEmail) {
          const { data: pelangganData } = await supabase
            .from('pelanggan')
            .select('name, phone, alamat, kecamatan, kabupaten, tanggal_lahir, membercard')
            .eq('email', userEmail)
            .limit(1)

          if (pelangganData && pelangganData.length > 0) {
            const p = pelangganData[0]
            if (!userPhone && p.phone) userPhone = p.phone
            if (p.name) userName = p.name
            if (p.alamat) userAlamat = p.alamat
            if (p.kecamatan) userKecamatan = p.kecamatan
            if (p.kabupaten) userKabupaten = p.kabupaten
            if (p.tanggal_lahir) userTanggalLahir = new Date(p.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            if (p.membercard) memberCardId = p.membercard
          }
        }

        // 3. Cocokkan dengan data pada tabel poin_transactions
        if (userPhone && userPhone !== "-") {
          const { data: poinData } = await supabase
            .from('poin_transactions')
            .select('poin, tipe, membercard')
            .eq('notelp', userPhone)

          if (poinData && poinData.length > 0) {
            userIsMember = true // Terdeteksi sebagai member karena ada data poin
            // Ambil membercard dari transaksi pertama jika ada
            const foundCard = poinData.find(t => t.membercard)?.membercard
            if (foundCard) memberCardId = foundCard

            // Hitung total poin
            userPoints = poinData.reduce((total: number, trx: any) => {
              const p = Number(trx.poin) || 0
              return trx.tipe === 'plus' ? total + p : total - p
            }, 0)
          }
        }

        if (!userPhone) userPhone = "-"

        setMemberData({
          name: userName,
          email: userEmail,
          phone: userPhone,
          points: userPoints,
          isMember: userIsMember || memberCardId !== "-",
          alamat: userAlamat,
          kecamatan: userKecamatan,
          kabupaten: userKabupaten,
          tanggalLahir: userTanggalLahir,
          membercard: memberCardId
        })
      } catch (error) {
        console.error("Failed to fetch member data", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemberData()
  }, [])

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8 bg-muted/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Profil Member</h1>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Memuat profil member..." />
        ) : memberData ? (
          <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Bagian Kiri: Kartu Premium */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className={`relative overflow-hidden p-8 text-white shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/20 ${memberData.isMember
                  ? 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-black ring-1 ring-white/10'
                  : 'bg-muted text-muted-foreground ring-1 ring-border'
                }`}>
                {/* Efek Cahaya / Glassmorphism */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 bg-gradient-to-b from-white/10 to-transparent w-64 h-64 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 bg-gradient-to-t from-primary/20 to-transparent w-64 h-64 rounded-full blur-3xl pointer-events-none" />

                {/* Konten Kartu */}
                <div className="relative z-10 flex flex-col h-full min-h-[240px] justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Maga Swalayan</h3>
                      <p className="text-xs font-medium text-white/40 tracking-widest mt-1">MEMBERSHIP CARD</p>
                    </div>
                    {/* Chip Hologram */}
                    <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200/90 via-yellow-400/80 to-yellow-600/90 shadow-inner flex items-center justify-center overflow-hidden">
                      <div className="w-full h-[1px] bg-black/20" />
                    </div>
                  </div>

                  <div className={`mt-12 transition-all duration-500 ${!memberData.isMember ? 'opacity-30 blur-sm' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white/50 tracking-widest uppercase mb-1">Total Poin</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 drop-shadow-sm pr-2 pb-1">
                            {memberData.isMember ? memberData.points.toLocaleString('id-ID') : '0'}
                          </span>
                          <span className="text-lg font-bold text-white/40">pts</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase mb-1 block">ID Member</span>
                        <span className="text-xl font-mono tracking-widest text-white/90">{memberData.membercard}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase block mb-1">Nama Pemilik</span>
                        <span className="text-sm font-bold tracking-wider uppercase text-white/90">{memberData.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase block mb-1">Status</span>
                        <span className="text-sm font-bold tracking-wider text-emerald-400 uppercase drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">Aktif</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay Belum Member */}
                {!memberData.isMember && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/70 backdrop-blur-xl p-6 text-center gap-5 overflow-hidden">
                    {/* Background Accents & Floating Graphics */}
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/20 blur-[60px] animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/20 blur-[60px] animate-pulse" style={{ animationDuration: '5s' }} />

                    {/* Floating Illustration Graphics */}
                    <ShoppingCart className="absolute top-8 left-8 md:top-12 md:left-16 w-20 h-20 text-orange-500/10 -rotate-12 animate-[pulse_5s_ease-in-out_infinite]" />
                    <Star className="absolute top-10 right-10 md:top-16 md:right-20 w-16 h-16 text-orange-400/10 rotate-45 animate-[pulse_4s_ease-in-out_infinite]" />
                    <Percent className="absolute bottom-10 left-10 md:bottom-16 md:left-20 w-20 h-20 text-orange-600/10 -rotate-12 animate-[pulse_7s_ease-in-out_infinite]" />
                    <Gift className="absolute bottom-8 right-8 md:bottom-12 md:right-16 w-24 h-24 text-amber-500/10 rotate-12 animate-[pulse_6s_ease-in-out_infinite]" />
                    <Sparkles className="absolute top-1/2 left-4 md:left-8 w-12 h-12 text-amber-400/10 rotate-12 animate-[pulse_3s_ease-in-out_infinite] -translate-y-1/2" />

                    <div className="relative z-10 flex flex-col items-center gap-5">
                      <img src="/logo.png" alt="Maga Swalayan Logo" className="w-16 h-16 object-contain mb-2 drop-shadow-md" />
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Gabung Member Maga</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">Dapatkan poin setiap belanja dan nikmati berbagai promo eksklusif khusus untuk Anda.</p>
                      </div>
                      <Button size="lg" className="rounded-none px-8 font-semibold shadow-lg hover:shadow-orange-500/25 transition-all hover:-translate-y-0.5" onClick={() => setIsRegisterModalOpen(true)}>
                        Daftar Sekarang
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bagian Kanan: Info Akun */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-card border-l-4 border-l-primary shadow-sm flex flex-col h-full transition-all hover:shadow-md">


                <div className="p-5 grid grid-cols-2 gap-3 flex-1 content-center">
                  <div className="bg-background border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">No. Telp</p>
                    <p className="font-medium text-foreground text-sm truncate">{memberData.phone}</p>
                  </div>

                  <div className="bg-background border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Kelahiran</p>
                    <p className="font-medium text-foreground text-sm truncate">{memberData.tanggalLahir}</p>
                  </div>

                  <div className="bg-background border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Email Login</p>
                    <p className="font-medium text-foreground text-sm truncate">{memberData.email}</p>
                  </div>

                  <div className="bg-background border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Alamat</p>
                    {memberData.alamat !== "-" ? (
                      <div className="flex flex-col gap-0.5">
                        <p className="font-medium text-foreground text-sm leading-relaxed">{memberData.alamat}</p>
                        <p className="font-medium text-foreground text-xs text-muted-foreground leading-relaxed">Kec. {memberData.kecamatan}, Kab. {memberData.kabupaten}</p>
                      </div>
                    ) : (
                      <p className="font-medium text-foreground text-sm leading-relaxed">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card border rounded-none">
            <p className="text-muted-foreground text-sm">Gagal memuat profil.</p>
          </div>
        )}
      </div>

      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border-primary/20">
          <DialogHeader>
            <DialogTitle>Pendaftaran Member Baru</DialogTitle>
            <DialogDescription>
              Lengkapi data Anda untuk bergabung menjadi member setia Maga Swalayan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterMember} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="regPhone">No. WhatsApp / Telp Aktif</Label>
              <Input id="regPhone" type="tel" required placeholder="Contoh: 08123456789" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regAlamat">Alamat Lengkap</Label>
              <Input id="regAlamat" required placeholder="Nama jalan, RT/RW, Desa" value={regAlamat} onChange={e => setRegAlamat(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regKecamatan">Kecamatan</Label>
                <Input id="regKecamatan" required value={regKecamatan} onChange={e => setRegKecamatan(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regKabupaten">Kabupaten</Label>
                <Input id="regKabupaten" required value={regKabupaten} onChange={e => setRegKabupaten(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="regTanggalLahir">Kelahiran</Label>
              <Input id="regTanggalLahir" type="date" required value={regTanggalLahir} onChange={e => setRegTanggalLahir(e.target.value)} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsRegisterModalOpen(false)} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar Sekarang
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

