"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Loader2, Mail, Phone, User, CreditCard, Award, MapPin, Calendar, Hash, ShoppingCart, Gift, Star, Percent, Sparkles, Pencil, ChevronDown, QrCode, Barcode, ScanLine } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { LocationCombobox, LocationItem } from "@/components/location-combobox"
import { syncPoinWithPelanggan, normalizePhone } from "@/lib/poin-sync"
import JsBarcode from "jsbarcode"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

interface MemberData {
  name: string
  username?: string
  email: string
  phone: string
  points: number
  isMember: boolean
  alamat: string
  provinsi?: string
  kecamatan: string
  kabupaten: string
  tanggalLahir: string
  membercard: string
}

import { usePathname } from "next/navigation"

export default function MemberPage() {
  const pathname = usePathname()
  const isCardView = pathname === "/card"
  const [memberData, setMemberData] = useState<MemberData | null>(null)

  const showInfoAkun = !isCardView && memberData?.isMember
  const [isLoading, setIsLoading] = useState(true)
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false)
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false)
  const barcodeRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (isBarcodeOpen && barcodeRef.current && memberData?.membercard) {
      try {
        JsBarcode(barcodeRef.current, memberData.membercard, {
          format: "CODE128",
          lineColor: "#000000",
          width: 2.2,
          height: 65,
          displayValue: true,
          font: "monospace",
          fontSize: 15,
          textMargin: 6,
          background: "#ffffff",
        })
      } catch (err) {
        console.error("Failed to render barcode:", err)
      }
    }
  }, [isBarcodeOpen, memberData?.membercard])

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [regUsername, setRegUsername] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regAlamat, setRegAlamat] = useState("")

  const [regProvinsiId, setRegProvinsiId] = useState("")
  const [regKabupatenId, setRegKabupatenId] = useState("")
  const [regKecamatanId, setRegKecamatanId] = useState("")

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editUsername, setEditUsername] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editAlamat, setEditAlamat] = useState("")
  const [editProvinsiId, setEditProvinsiId] = useState("")
  const [editKabupatenId, setEditKabupatenId] = useState("")
  const [editKecamatanId, setEditKecamatanId] = useState("")
  const [editTgl, setEditTgl] = useState("")
  const [editBln, setEditBln] = useState("")
  const [editThn, setEditThn] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const [editRegencies, setEditRegencies] = useState<LocationItem[]>([])
  const [editDistricts, setEditDistricts] = useState<LocationItem[]>([])
  const [isLoadingEditRegencies, setIsLoadingEditRegencies] = useState(false)
  const [isLoadingEditDistricts, setIsLoadingEditDistricts] = useState(false)

  const [provinces, setProvinces] = useState<LocationItem[]>([])
  const [regencies, setRegencies] = useState<LocationItem[]>([])
  const [districts, setDistricts] = useState<LocationItem[]>([])
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(false)
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false)

  useEffect(() => {
    async function fetchProvinces() {
      setIsLoadingProvinces(true)
      try {
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
        const data = await res.json()
        setProvinces(data)
      } catch (error) {
        console.error("Failed to fetch provinces", error)
      } finally {
        setIsLoadingProvinces(false)
      }
    }
    if (isRegisterModalOpen || isEditModalOpen) fetchProvinces()
  }, [isRegisterModalOpen, isEditModalOpen])

  useEffect(() => {
    if (!editProvinsiId) {
      setEditRegencies([])
      setEditKabupatenId("")
      return
    }
    async function fetchEditRegencies() {
      setIsLoadingEditRegencies(true)
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${editProvinsiId}.json`)
        const data = await res.json()
        setEditRegencies(data)
      } catch (error) {
        console.error("Failed to fetch edit regencies", error)
      } finally {
        setIsLoadingEditRegencies(false)
      }
    }
    fetchEditRegencies()
  }, [editProvinsiId])

  useEffect(() => {
    if (!editKabupatenId) {
      setEditDistricts([])
      setEditKecamatanId("")
      return
    }
    async function fetchEditDistricts() {
      setIsLoadingEditDistricts(true)
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${editKabupatenId}.json`)
        const data = await res.json()
        setEditDistricts(data)
      } catch (error) {
        console.error("Failed to fetch edit districts", error)
      } finally {
        setIsLoadingEditDistricts(false)
      }
    }
    fetchEditDistricts()
  }, [editKabupatenId])

  useEffect(() => {
    if (!regProvinsiId) {
      setRegencies([])
      setRegKabupatenId("")
      return
    }
    async function fetchRegencies() {
      setIsLoadingRegencies(true)
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${regProvinsiId}.json`)
        const data = await res.json()
        setRegencies(data)
      } catch (error) {
        console.error("Failed to fetch regencies", error)
      } finally {
        setIsLoadingRegencies(false)
      }
    }
    fetchRegencies()
  }, [regProvinsiId])

  useEffect(() => {
    if (!regKabupatenId) {
      setDistricts([])
      setRegKecamatanId("")
      return
    }
    async function fetchDistricts() {
      setIsLoadingDistricts(true)
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regKabupatenId}.json`)
        const data = await res.json()
        setDistricts(data)
      } catch (error) {
        console.error("Failed to fetch districts", error)
      } finally {
        setIsLoadingDistricts(false)
      }
    }
    fetchDistricts()
  }, [regKabupatenId])

  const [regTgl, setRegTgl] = useState("")
  const [regBln, setRegBln] = useState("")
  const [regThn, setRegThn] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenEditModal = () => {
    if (!memberData) return
    setEditUsername(memberData.username || memberData.name || "")
    setEditPhone(memberData.phone !== "-" ? memberData.phone : "")
    setEditAlamat(memberData.alamat !== "-" ? memberData.alamat : "")
    setEditProvinsiId("")
    setEditKabupatenId("")
    setEditKecamatanId("")

    if (memberData.tanggalLahir && memberData.tanggalLahir !== "-") {
      const parts = memberData.tanggalLahir.split("-")
      if (parts.length === 3) {
        setEditTgl(parts[0])
        setEditBln(parts[1])
        setEditThn(parts[2])
      }
    } else {
      setEditTgl("")
      setEditBln("")
      setEditThn("")
    }

    setIsEditModalOpen(true)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberData) return
    setIsUpdating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("Sesi login telah berakhir, silakan login kembali.")
      const userEmail = session.user.email || memberData.email

      const trimmedPhone = editPhone.trim()
      const cleanPhone = normalizePhone(trimmedPhone)

      if (trimmedPhone && trimmedPhone !== "-") {
        if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
          toast.error("Nomor Telepon Tidak Valid", {
            description: "Nomor WhatsApp / telepon harus terdiri dari 10 sampai 15 digit angka."
          })
          setIsUpdating(false)
          return
        }

        // Proteksi nomor telepon: Cek apakah sudah terdaftar pada akun lain di tabel pelanggan
        const { data: existingPhoneRows, error: checkError } = await supabase
          .from('pelanggan')
          .select('id, email, phone')
          .neq('email', userEmail)

        if (checkError) throw checkError

        const isDuplicate = existingPhoneRows?.some(
          row => row.phone && row.phone !== '-' && normalizePhone(row.phone) === cleanPhone
        )

        if (isDuplicate) {
          toast.error("Nomor Telepon Sudah Digunakan", {
            description: "Nomor WhatsApp / telepon ini sudah terdaftar pada akun member lain. Silakan gunakan nomor yang berbeda."
          })
          setIsUpdating(false)
          return
        }
      }

      const toTitleCase = (str: string) => str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())
      const selectedProv = editProvinsiId
        ? toTitleCase(provinces.find(p => p.id === editProvinsiId)?.name || "")
        : (memberData.provinsi && memberData.provinsi !== "-" ? memberData.provinsi : "")

      const selectedKab = editKabupatenId
        ? toTitleCase(editRegencies.find(r => r.id === editKabupatenId)?.name || "")
        : (memberData.kabupaten && memberData.kabupaten !== "-" ? memberData.kabupaten : "")

      const selectedKec = editKecamatanId
        ? toTitleCase(editDistricts.find(d => d.id === editKecamatanId)?.name || "")
        : (memberData.kecamatan && memberData.kecamatan !== "-" ? memberData.kecamatan : "")

      const finalTanggalLahir = (editThn && editBln && editTgl)
        ? `${editThn}-${editBln.padStart(2, '0')}-${editTgl.padStart(2, '0')}`
        : null

      const finalName = editUsername.trim() || memberData.name

      const payload: any = {
        name: finalName,
        username: finalName,
        phone: cleanPhone || trimmedPhone || "-",
        alamat: editAlamat.trim() || "-",
        provinsi: selectedProv || null,
        kabupaten: selectedKab || null,
        kecamatan: selectedKec || null,
        tanggal_lahir: finalTanggalLahir
      }

      const { error: updateError } = await supabase
        .from('pelanggan')
        .update(payload)
        .eq('email', userEmail)

      if (updateError) throw updateError

      const formattedTgl = (editThn && editBln && editTgl)
        ? `${editTgl.padStart(2, '0')}-${editBln.padStart(2, '0')}-${editThn}`
        : "-"

      setMemberData(prev => prev ? {
        ...prev,
        name: finalName,
        username: finalName,
        phone: payload.phone,
        alamat: payload.alamat,
        provinsi: selectedProv || "-",
        kabupaten: selectedKab || "-",
        kecamatan: selectedKec || "-",
        tanggalLahir: formattedTgl
      } : null)

      // Sync poin jika ada transaksi dengan nomor telp baru
      await syncPoinWithPelanggan().catch(console.error)

      toast.success("Profil Berhasil Diperbarui", {
        description: "Informasi profil member Anda telah berhasil disimpan."
      })

      setIsEditModalOpen(false)
    } catch (err: any) {
      toast.error("Gagal Memperbarui Profil", {
        description: err.message || "Terjadi kesalahan saat menyimpan data."
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const trimmedPhone = regPhone.trim()
      const cleanPhone = normalizePhone(trimmedPhone)

      if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 15) {
        toast.error("Nomor Telepon Tidak Valid", {
          description: "Nomor WhatsApp / telepon harus terdiri dari 10 sampai 15 digit angka."
        })
        setIsSubmitting(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("Anda harus login")
      const userEmail = session.user.email || ""

      // Proteksi nomor telepon: Cek apakah sudah terdaftar pada akun lain di tabel pelanggan
      const { data: existingPhoneRows, error: checkError } = await supabase
        .from('pelanggan')
        .select('id, email, phone')
        .neq('email', userEmail)

      if (checkError) throw checkError

      const isDuplicate = existingPhoneRows?.some(
        row => row.phone && row.phone !== '-' && normalizePhone(row.phone) === cleanPhone
      )

      if (isDuplicate) {
        toast.error("Nomor Telepon Sudah Digunakan", {
          description: "Nomor WhatsApp / telepon ini sudah terdaftar pada akun member lain. Silakan gunakan nomor yang berbeda."
        })
        setIsSubmitting(false)
        return
      }

      // 1. Cek apakah nomor telepon sudah ada di poin_transactions untuk mengambil membercard lama
      const { data: poinData } = await supabase
        .from('poin_transactions')
        .select('membercard')
        .or(`notelp.eq.${cleanPhone},notelp.eq.${trimmedPhone}`)
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
      const defaultName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0]
      const finalName = regUsername.trim() || defaultName

      const { data: existing } = await supabase.from('pelanggan').select('id').eq('email', userEmail).limit(1)

      const toTitleCase = (str: string) => str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())
      const selectedProv = toTitleCase(provinces.find(p => p.id === regProvinsiId)?.name || "")
      const selectedKab = toTitleCase(regencies.find(r => r.id === regKabupatenId)?.name || "")
      const selectedKec = toTitleCase(districts.find(d => d.id === regKecamatanId)?.name || "")

      const payload = {
        name: finalName,
        username: finalName,
        email: userEmail,
        phone: cleanPhone,
        alamat: regAlamat,
        provinsi: selectedProv,
        kecamatan: selectedKec,
        kabupaten: selectedKab,
        tanggal_lahir: (regThn && regBln && regTgl) ? `${regThn}-${regBln.padStart(2, '0')}-${regTgl.padStart(2, '0')}` : null,
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

      await syncPoinWithPelanggan().catch(console.error)

      toast.success("Berhasil Mendaftar Member", {
        description: `Member berhasil didaftarkan dengan ID: ${newId}`
      })

      setIsRegisterModalOpen(false)
      // Reload halaman agar data poin lama langsung terambil dari database
      window.location.reload()

    } catch (error: any) {
      toast.error("Gagal Mendaftar", {
        description: error.message || "Terjadi kesalahan saat pendaftaran."
      })
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
        let userProvinsi = "-"
        let userKecamatan = "-"
        let userKabupaten = "-"
        let userTanggalLahir = "-"

        let userUsername = ""
        if (userEmail) {
          const { data: pelangganData } = await supabase
            .from('pelanggan')
            .select('name, username, phone, alamat, provinsi, kecamatan, kabupaten, tanggal_lahir, membercard')
            .eq('email', userEmail)
            .limit(1)

          if (pelangganData && pelangganData.length > 0) {
            const p = pelangganData[0]
            if (!userPhone && p.phone) userPhone = p.phone
            if (p.name) userName = p.name
            if (p.username) userUsername = p.username
            if (p.alamat) userAlamat = p.alamat
            if (p.provinsi) userProvinsi = p.provinsi
            if (p.kecamatan) userKecamatan = p.kecamatan
            if (p.kabupaten) userKabupaten = p.kabupaten
            if (p.tanggal_lahir) {
              const d = new Date(p.tanggal_lahir);
              userTanggalLahir = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
            }
            if (p.membercard) memberCardId = p.membercard
          }
        }

        // 3. Cocokkan dengan data pada tabel poin_transactions
        const trxConditions: string[] = []
        if (memberCardId && memberCardId !== "-") {
          trxConditions.push(`membercard.eq.${memberCardId}`)
        }
        if (userPhone && userPhone !== "-") {
          trxConditions.push(`notelp.eq.${userPhone}`)
        }

        if (trxConditions.length > 0) {
          const { data: poinData } = await supabase
            .from('poin_transactions')
            .select('poin, tipe, membercard, notelp')
            .or(trxConditions.join(','))

          if (poinData && poinData.length > 0) {
            userIsMember = true // Terdeteksi sebagai member karena ada data poin
            // Ambil membercard dari transaksi pertama jika ada dan belum punya
            if (memberCardId === "-") {
              const foundCard = poinData.find(t => t.membercard)?.membercard
              if (foundCard) memberCardId = foundCard
            }

            // Hitung total poin
            userPoints = poinData.reduce((total: number, trx: any) => {
              const p = Number(trx.poin) || 0
              const isPlus = (trx.tipe || 'plus').toLowerCase() === 'plus'
              return isPlus ? total + p : total - p
            }, 0)
          }
        }

        if (!userPhone) userPhone = "-"

        setMemberData({
          name: userName,
          username: userUsername,
          email: userEmail,
          phone: userPhone,
          points: userPoints,
          isMember: userIsMember || memberCardId !== "-",
          alamat: userAlamat,
          provinsi: userProvinsi,
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
          <h1 className="text-md md:text-xl font-bold tracking-tight">{isCardView ? "Member Card" : "Profil Member"}</h1>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Memuat profil member..." />
        ) : memberData ? (
          <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-700", !showInfoAkun ? "flex justify-center" : "grid gap-8 lg:grid-cols-12")}>
            {/* Bagian Kiri/Tengah: Kartu Premium */}
            <div className={cn("flex flex-col gap-6", !showInfoAkun ? "w-full max-w-2xl" : "lg:col-span-7")}>
              {memberData.isMember ? (
                <div className="relative overflow-hidden p-5 sm:p-8 text-white shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black ring-1 ring-white/10 rounded-sm">
                  {/* Efek Cahaya / Glassmorphism */}
                  <div className="absolute top-0 right-0 -mt-16 -mr-16 bg-gradient-to-b from-white/10 to-transparent w-64 h-64 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 -mb-16 -ml-16 bg-gradient-to-t from-primary/20 to-transparent w-64 h-64 rounded-full blur-3xl pointer-events-none" />

                  {/* Konten Kartu */}
                  <div className="relative z-10 flex flex-col h-full min-h-[180px] sm:min-h-[240px] justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Maga Swalayan</h3>
                        <p className="text-[10px] sm:text-xs font-medium text-white/40 tracking-widest mt-1">MEMBERSHIP CARD</p>
                      </div>
                      {/* Chip Hologram */}
                      <div className="w-10 h-7 sm:w-12 sm:h-9 rounded bg-gradient-to-br from-yellow-200/90 via-yellow-400/80 to-yellow-600/90 shadow-inner flex items-center justify-center overflow-hidden">
                        <div className="w-full h-[1px] bg-black/20" />
                      </div>
                    </div>

                    <div className="mt-8 sm:mt-12 transition-all duration-500">
                      <div className="flex flex-row justify-between items-end gap-2 sm:gap-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] sm:text-xs font-medium text-white/50 tracking-widest uppercase mb-1">Total Poin</span>
                          <div className="flex items-baseline gap-1 sm:gap-1.5">
                            <span className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 drop-shadow-sm pr-1 sm:pr-2 pb-1">
                              {memberData.points.toLocaleString('id-ID')}
                            </span>
                            <span className="text-sm sm:text-lg font-bold text-white/40">pts</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] sm:text-[10px] font-medium text-white/40 tracking-widest uppercase mb-1 block">ID Member</span>
                          <span
                            onClick={() => setIsBarcodeOpen(!isBarcodeOpen)}
                            className="text-sm sm:text-xl font-mono tracking-widest text-white/90 hover:text-white cursor-pointer select-none"
                            title="Klik untuk buka/tutup Barcode Scan"
                          >
                            {memberData.membercard}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-white/10 flex justify-between items-center">
                        <div>
                          <span className="text-[8px] sm:text-[10px] font-medium text-white/40 tracking-widest uppercase block mb-0.5 sm:mb-1">Nama Pemilik</span>
                          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white/90">{memberData.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] sm:text-[10px] font-medium text-white/40 tracking-widest uppercase block mb-0.5 sm:mb-1">Status</span>
                          <span className="text-xs sm:text-sm font-bold tracking-wider text-emerald-400 uppercase drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">Aktif</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-4 sm:p-6 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full min-h-[240px] transition-all hover:shadow-md">
                  <div className="flex flex-col items-center gap-5 sm:gap-6 w-full max-w-sm mx-auto mt-4">
                    <img src="/logo-maga2.png" alt="Maga Swalayan Logo" className="h-14 sm:h-16 object-contain drop-shadow-sm dark:brightness-0 dark:invert" />
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-gray/80 font-bold text-gray-700 dark:text-white tracking-tight">Gabung Member</h3>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                        Dapatkan poin setiap belanja dan nikmati promo eksklusif khusus untuk Anda yang ikut bergabung menjadi member.
                      </p>
                    </div>
                    <Button className="w-full mt-2 h-11 sm:h-12 rounded-full font-bold shadow-md hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base" onClick={() => setIsRegisterModalOpen(true)}>
                      Daftar Sekarang
                    </Button>
                  </div>
                </div>
              )}

              {/* Menu Buka-Tutup Barcode Scan */}
              {memberData.isMember && (
                <div className="w-full bg-card border border-border/60 rounded-sm shadow-sm overflow-hidden transition-all duration-300">
                  {/* Header Bar Bersih (Hanya Judul & Chevron Saat Tertutup) */}
                  <div
                    onClick={() => setIsBarcodeOpen(!isBarcodeOpen)}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <QrCode className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">Barcode Scan</span>
                    </div>

                    <div className="p-1 text-muted-foreground hover:text-foreground transition-transform duration-300">
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isBarcodeOpen && "rotate-180")} />
                    </div>
                  </div>

                  {/* Panel Terbuka: Hanya Menampilkan Barcode 1D & QR Code ID Member */}
                  {isBarcodeOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-white rounded-sm border border-zinc-200 p-4 shadow-xs flex flex-col items-center justify-center gap-3 text-black">
                        {/* 1D Barcode */}
                        <div className="w-full flex justify-center overflow-x-auto py-1">
                          <svg ref={barcodeRef} className="max-w-full" />
                        </div>

                        {/* 2D QR Code */}
                        <div className="p-2 border border-zinc-200 rounded-sm bg-white">
                          <QRCodeSVG
                            value={memberData.membercard || "MG-SW000001"}
                            size={160}
                            level="H"
                            includeMargin={true}
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Menu Buka-Tutup Informasi & Ubah Data untuk tampilan /card */}
              {isCardView && memberData.isMember && (
                <div className="w-full bg-card border border-border/60 rounded-sm shadow-sm overflow-hidden transition-all duration-300">
                  {/* Header Bar Bersih & Minimalis (Hanya Judul & Chevron Saat Tertutup) */}
                  <div
                    onClick={() => setIsCardDetailsOpen(!isCardDetailsOpen)}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">Informasi Akun</span>
                    </div>

                    <div className="p-1 text-muted-foreground hover:text-foreground transition-transform duration-300">
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isCardDetailsOpen && "rotate-180")} />
                    </div>
                  </div>

                  {/* Panel Detail Rincian Akun & Ubah Data (Hanya Muncul Saat Dibuka) */}
                  {isCardDetailsOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/40 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-2 gap-2.5 mt-3">
                        <div className="bg-background dark:bg-muted/20 border border-border/50 rounded-sm p-3 col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Nama Pengguna</p>
                          <p className="font-medium text-foreground text-sm truncate">{memberData.username || memberData.name}</p>
                        </div>

                        <div className="bg-background dark:bg-muted/20 border border-border/50 rounded-sm p-3 col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">No. Telp</p>
                          <p className="font-medium text-foreground text-sm truncate">{memberData.phone}</p>
                        </div>

                        <div className="bg-background dark:bg-muted/20 border border-border/50 rounded-sm p-3 col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Kelahiran</p>
                          <p className="font-medium text-foreground text-sm truncate">{memberData.tanggalLahir}</p>
                        </div>

                        <div className="bg-background dark:bg-muted/20 border border-border/50 rounded-sm p-3 col-span-2 sm:col-span-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Email Login</p>
                          <p className="font-medium text-foreground text-sm truncate">{memberData.email}</p>
                        </div>

                        <div className="bg-background dark:bg-muted/20 border border-border/50 rounded-sm p-3 col-span-2">
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

                      <div className="mt-3 pt-3 border-t border-border/40 flex justify-end">
                        <Button
                          size="sm"
                          onClick={handleOpenEditModal}
                          className="h-8 px-3.5 gap-1.5 text-xs font-semibold cursor-pointer rounded-sm"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Ubah Data Profil
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bagian Kanan: Info Akun */}
            {showInfoAkun && (
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-card border-l-4 border-l-primary shadow-sm flex flex-col h-full transition-all hover:shadow-md">
                  <div className="px-5 pt-4 pb-2 flex justify-between items-center border-b border-border/40">
                    <span className="font-bold text-sm text-foreground">Informasi Akun</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenEditModal}
                      className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Ubah Data
                    </Button>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3 flex-1 content-center">
                    <div className="bg-background dark:bg-muted/20 border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Nama Pengguna</p>
                      <p className="font-medium text-foreground text-sm truncate">{memberData.username || memberData.name}</p>
                    </div>

                    <div className="bg-background dark:bg-muted/20 border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">No. Telp</p>
                      <p className="font-medium text-foreground text-sm truncate">{memberData.phone}</p>
                    </div>

                    <div className="bg-background dark:bg-muted/20 border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Kelahiran</p>
                      <p className="font-medium text-foreground text-sm truncate">{memberData.tanggalLahir}</p>
                    </div>

                    <div className="bg-background dark:bg-muted/20 border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Email Login</p>
                      <p className="font-medium text-foreground text-sm truncate">{memberData.email}</p>
                    </div>

                    <div className="bg-background dark:bg-muted/20 border rounded-none p-3 shadow-sm transition-all hover:shadow-md col-span-2">
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
            )}
          </div>
        ) : (
          <div className="flex justify-center w-full mt-8 lg:mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-4 sm:p-6 text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full max-w-2xl min-h-[240px] transition-all hover:shadow-md">
              <div className="flex flex-col items-center gap-5 sm:gap-6 w-full max-w-sm mx-auto mt-4">
                <img src="/logo-maga2.png" alt="Maga Swalayan Logo" className="h-14 sm:h-16 object-contain drop-shadow-sm dark:brightness-0 dark:invert" />
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-gray/80 font-bold text-gray-700 dark:text-white tracking-tight">Anda Belum Login</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                    Silakan masuk ke akun Anda terlebih dahulu untuk mengakses menu Member dan menikmati fitur poin serta diskon eksklusif.
                  </p>
                </div>
                <Button className="w-full mt-2 h-11 sm:h-12 rounded-full font-bold shadow-md hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base" onClick={() => window.location.href = "/login?next=/member"}>
                  Masuk / Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border-primary/20">
          <button type="button" tabIndex={0} className="sr-only" aria-hidden="true" />
          <DialogHeader>
            <DialogTitle className="text-[15px] text-primary font-bold">Pendaftaran Member Baru</DialogTitle>
            <DialogDescription className="text-[11px]">
              Lengkapi data Anda untuk bergabung menjadi
              <br />
              member setia Maga Swalayan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterMember} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="regUsername">Nama Pengguna</Label>
              <Input
                id="regUsername"
                type="text"
                required
                placeholder="Masukkan nama pengguna"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regPhone">No. WhatsApp / Telp Aktif</Label>
              <Input
                id="regPhone"
                type="tel"
                required
                placeholder="Contoh: 08123456789"
                value={regPhone}
                onChange={e => setRegPhone(e.target.value.replace(/[^0-9+]/g, ''))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regAlamat">Alamat Lengkap</Label>
              <Input id="regAlamat" required placeholder="Masukkan Alamat" value={regAlamat} onChange={e => setRegAlamat(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Provinsi</Label>
              <LocationCombobox
                value={regProvinsiId}
                onChange={(val, name) => { setRegProvinsiId(val); setRegKabupatenId(""); setRegKecamatanId(""); }}
                items={provinces}
                isLoading={isLoadingProvinces}
                placeholder="Pilih Provinsi..."
                searchPlaceholder="Cari provinsi..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kabupaten</Label>
                <LocationCombobox
                  value={regKabupatenId}
                  onChange={(val, name) => { setRegKabupatenId(val); setRegKecamatanId(""); }}
                  items={regencies}
                  isLoading={isLoadingRegencies}
                  placeholder="Pilih Kabupaten..."
                  searchPlaceholder="Cari kabupaten..."
                  disabled={!regProvinsiId}
                />
              </div>
              <div className="space-y-2">
                <Label>Kecamatan</Label>
                <LocationCombobox
                  value={regKecamatanId}
                  onChange={(val, name) => setRegKecamatanId(val)}
                  items={districts}
                  isLoading={isLoadingDistricts}
                  placeholder="Pilih Kecamatan..."
                  searchPlaceholder="Cari kecamatan..."
                  disabled={!regKabupatenId}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kelahiran</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={regTgl} onValueChange={(val) => setRegTgl(val || "")} required>
                  <SelectTrigger className="w-full [&>span]:flex-1 [&>span]:justify-center [&>span]:text-center">
                    <SelectValue placeholder="Tanggal" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]" alignItemWithTrigger={false}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                      const padded = String(d).padStart(2, '0');
                      return <SelectItem key={d} value={padded}>{padded}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Select value={regBln} onValueChange={(val) => setRegBln(val || "")} required>
                  <SelectTrigger className="w-full [&>span]:flex-1 [&>span]:justify-center [&>span]:text-center">
                    <SelectValue placeholder="Bulan">
                      {regBln ? ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"][parseInt(regBln) - 1] : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]" alignItemWithTrigger={false}>
                    {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"].map((name, i) => {
                      const padded = String(i + 1).padStart(2, '0');
                      return <SelectItem key={padded} value={padded}>{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Select value={regThn} onValueChange={(val) => setRegThn(val || "")} required>
                  <SelectTrigger className="w-full [&>span]:flex-1 [&>span]:justify-center [&>span]:text-center">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]" alignItemWithTrigger={false}>
                    {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

      {/* Dialog Ubah Data Member */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-none border-primary/20">
          <button type="button" tabIndex={0} className="sr-only" aria-hidden="true" />
          <DialogHeader>
            <DialogTitle className="text-[15px] text-primary font-bold">Ubah Informasi Akun</DialogTitle>
            <DialogDescription className="text-[11px]">
              Perbarui nama pengguna, nomor telepon, alamat, atau tanggal lahir Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editUsername">Nama Pengguna</Label>
              <Input
                id="editUsername"
                type="text"
                required
                placeholder="Masukkan nama pengguna"
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">No. WhatsApp / Telp Aktif</Label>
              <Input
                id="editPhone"
                type="tel"
                required
                placeholder="Contoh: 08123456789"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value.replace(/[^0-9+]/g, ''))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAlamat">Alamat Lengkap</Label>
              <Input
                id="editAlamat"
                required
                placeholder="Masukkan Alamat"
                value={editAlamat}
                onChange={e => setEditAlamat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Provinsi</Label>
                {memberData?.provinsi && memberData.provinsi !== "-" && !editProvinsiId && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">Saat ini: {memberData.provinsi}</span>
                )}
              </div>
              <LocationCombobox
                value={editProvinsiId}
                onChange={(val, name) => { setEditProvinsiId(val); setEditKabupatenId(""); setEditKecamatanId(""); }}
                items={provinces}
                isLoading={isLoadingProvinces}
                placeholder={memberData?.provinsi && memberData.provinsi !== "-" ? `Ubah provinsi (${memberData.provinsi})...` : "Pilih Provinsi..."}
                searchPlaceholder="Cari provinsi..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kabupaten</Label>
                <LocationCombobox
                  value={editKabupatenId}
                  onChange={(val, name) => { setEditKabupatenId(val); setEditKecamatanId(""); }}
                  items={editRegencies}
                  isLoading={isLoadingEditRegencies}
                  placeholder={memberData?.kabupaten && memberData.kabupaten !== "-" && !editProvinsiId ? memberData.kabupaten : "Pilih..."}
                  searchPlaceholder="Cari kabupaten..."
                  disabled={!editProvinsiId}
                />
              </div>
              <div className="space-y-2">
                <Label>Kecamatan</Label>
                <LocationCombobox
                  value={editKecamatanId}
                  onChange={(val, name) => setEditKecamatanId(val)}
                  items={editDistricts}
                  isLoading={isLoadingEditDistricts}
                  placeholder={memberData?.kecamatan && memberData.kecamatan !== "-" && !editKabupatenId ? memberData.kecamatan : "Pilih..."}
                  searchPlaceholder="Cari kecamatan..."
                  disabled={!editKabupatenId}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kelahiran</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={editTgl} onValueChange={(val) => setEditTgl(val || "")}>
                  <SelectTrigger className="w-full [&>span]:flex-1 [&>span]:justify-center [&>span]:text-center">
                    <SelectValue placeholder="Tanggal" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]" alignItemWithTrigger={false}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                      const padded = String(d).padStart(2, '0');
                      return <SelectItem key={d} value={padded}>{padded}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Select value={editBln} onValueChange={(val) => setEditBln(val || "")}>
                  <SelectTrigger className="w-full [&>span]:flex-1 [&>span]:justify-center [&>span]:text-center">
                    <SelectValue placeholder="Bulan">
                      {editBln ? ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"][parseInt(editBln) - 1] : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]" alignItemWithTrigger={false}>
                    {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"].map((name, i) => {
                      const padded = String(i + 1).padStart(2, '0');
                      return <SelectItem key={padded} value={padded}>{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Select value={editThn} onValueChange={(val) => setEditThn(val || "")}>
                  <SelectTrigger className="w-full [&>span]:flex-1 [&>span]:justify-center [&>span]:text-center">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]" alignItemWithTrigger={false}>
                    {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating}>Batal</Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

