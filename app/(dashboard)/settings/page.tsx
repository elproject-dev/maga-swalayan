"use client"
import { toast } from "@/components/ui/toast"
import { Loader2, Pencil, Tag, Calendar, Package, Image as ImageIcon, Search } from "lucide-react"
import { uploadMedia } from "@/lib/storage"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { TablePagination } from "@/components/table-pagination"

import { Skeleton } from "@/components/ui/skeleton"

import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

const formatRupiah = (value: string) => {
  const rawNumber = value.replace(/\D/g, "")
  if (!rawNumber) return ""
  const formatted = parseInt(rawNumber, 10).toLocaleString("id-ID")
  return `Rp ${formatted}`
}

const dummyPromos = [
  { id: 1, title: "Sayur Segar", promo: "Diskon 20%", src: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&h=400&fit=crop" },
  { id: 2, title: "Bumbu Dapur", promo: "Beli 2 Gratis 1", src: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop" },
  { id: 3, title: "Produk Susu", promo: "Hemat Rp 5.000", src: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&h=400&fit=crop" },
  { id: 4, title: "Perawatan Tubuh", promo: "Diskon Up To 50%", src: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=400&fit=crop" },
  { id: 5, title: "Camilan Sehat", promo: "Promo Akhir Pekan", src: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&h=400&fit=crop" },
  { id: 6, title: "Minuman Dingin", promo: "Beli 1 Gratis 1", src: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop" },
  { id: 7, title: "Alat Kebersihan", promo: "Diskon 10%", src: "https://images.unsplash.com/photo-1584824486509-112e4181f1ce?w=600&h=400&fit=crop" },
  { id: 8, title: "Kebutuhan Bayi", promo: "Harga Spesial", src: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=400&fit=crop" },
];

const dummyPilihanHariIni = [
  { id: 1, title: "Minyak Goreng 2L", price: "Rp 32.500", src: "https://images.unsplash.com/photo-1620021508207-1d575cde0440?w=400&h=400&fit=crop" },
  { id: 2, title: "Beras Premium 5kg", price: "Rp 68.000", src: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&h=400&fit=crop" },
  { id: 3, title: "Gula Pasir 1kg", price: "Rp 15.000", src: "https://images.unsplash.com/photo-1622485501177-3e6f98725f0a?w=400&h=400&fit=crop" },
  { id: 4, title: "Susu UHT 1L", price: "Rp 18.500", src: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop" },
  { id: 5, title: "Telur Ayam 1kg", price: "Rp 27.000", src: "https://images.unsplash.com/photo-1506976773554-152e46b8d4f4?w=400&h=400&fit=crop" },
  { id: 6, title: "Mie Instan Goreng", price: "Rp 3.000", src: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&h=400&fit=crop" },
];

const dummyProdukHariIni = [
  { id: 1, title: "Minyak Goreng 2L", price: "Rp 32.500", src: "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?w=600&h=400&fit=crop" },
  { id: 2, title: "Beras Premium 5kg", price: "Rp 69.000", src: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=600&h=400&fit=crop" },
];

const menuItems = [
  { id: 'promo', label: 'Manajemen Promo', icon: Tag },
  { id: 'pilihan', label: 'Pilihan Hari Ini', icon: Calendar },
  { id: 'produk', label: 'Produk', icon: Package },
  { id: 'banner', label: 'Banner', icon: ImageIcon },
]

// Image upload now uses Supabase Storage bucket 'media'
// See lib/storage.ts for uploadMedia helper

export default function SettingsPage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeMenu])
  const [isMounted, setIsMounted] = useState(false)

  const [promos, setPromos] = useState<any[]>(dummyPromos)
  const [searchPromoQuery, setSearchPromoQuery] = useState("")
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newPromo, setNewPromo] = useState({ title: "", promo: "", src: "" })
  const [fileName, setFileName] = useState("")
  const [promoFile, setPromoFile] = useState<File | null>(null)

  const [pilihans, setPilihans] = useState<any[]>(dummyPilihanHariIni)
  const [searchPilihanQuery, setSearchPilihanQuery] = useState("")
  const [selectedPilihanRows, setSelectedPilihanRows] = useState<number[]>([])
  const [isPilihanDialogOpen, setIsPilihanDialogOpen] = useState(false)
  const [editingPilihanId, setEditingPilihanId] = useState<number | null>(null)
  const [isSavingPilihan, setIsSavingPilihan] = useState(false)
  const [newPilihan, setNewPilihan] = useState({ title: "", price: "", src: "" })
  const [pilihanFileName, setPilihanFileName] = useState("")
  const [pilihanFile, setPilihanFile] = useState<File | null>(null)

  const [produks, setProduks] = useState<any[]>(dummyProdukHariIni)
  const [searchProdukQuery, setSearchProdukQuery] = useState("")
  const [selectedProdukRows, setSelectedProdukRows] = useState<number[]>([])
  const [isProdukDialogOpen, setIsProdukDialogOpen] = useState(false)
  const [editingProdukId, setEditingProdukId] = useState<number | null>(null)
  const [isSavingProduk, setIsSavingProduk] = useState(false)
  const [newProduk, setNewProduk] = useState({ title: "", price: "", src: "" })
  const [produkFileName, setProdukFileName] = useState("")
  const [produkFile, setProdukFile] = useState<File | null>(null)

  const [banners, setBanners] = useState<any[]>([])
  const [searchBannerQuery, setSearchBannerQuery] = useState("")
  const [selectedBannerRows, setSelectedBannerRows] = useState<number[]>([])
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false)
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null)
  const [isSavingBanner, setIsSavingBanner] = useState(false)
  const [newBanner, setNewBanner] = useState({ title: "", src: "" })
  const [bannerFileName, setBannerFileName] = useState("")
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  const filteredPromos = promos.filter((p) => {
    const q = searchPromoQuery.toLowerCase()
    return p.title.toLowerCase().includes(q) || p.promo.toLowerCase().includes(q)
  })

  const filteredPilihans = pilihans.filter((p) => {
    const q = searchPilihanQuery.toLowerCase()
    return p.title.toLowerCase().includes(q) || p.price.toLowerCase().includes(q)
  })

  const filteredProduks = produks.filter((p) => {
    const q = searchProdukQuery.toLowerCase()
    return p.title.toLowerCase().includes(q) || p.price.toLowerCase().includes(q)
  })

  const filteredBanners = banners.filter((b) => {
    const q = searchBannerQuery.toLowerCase()
    return b.title.toLowerCase().includes(q)
  })

  const [isLoading, setIsLoading] = useState(true)

  const fetchAll = async () => {
    setIsLoading(true)
    const { data: promosData } = await supabase.from('promo').select('*').order('id', { ascending: true })
    if (promosData) setPromos(promosData)

    const { data: pilihansData } = await supabase.from('pilihan').select('*').order('id', { ascending: true })
    if (pilihansData) setPilihans(pilihansData)

    const { data: produksData } = await supabase.from('produk').select('*').order('id', { ascending: true })
    if (produksData) setProduks(produksData)

    const { data: bannerData } = await supabase.from('banner').select('*').order('id', { ascending: true })
    if (bannerData) setBanners(bannerData)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAll()
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8">
        <div className="flex flex-col">
          <Skeleton className="h-8 w-64 rounded-none" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-none" />
          ))}
        </div>
        <div className="w-full pt-4 border-t flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 rounded-none" />
            <Skeleton className="h-10 w-32 rounded-none" />
          </div>
          <Skeleton className="h-64 w-full rounded-none" />
        </div>
      </div>
    )
  }

  const isAllSelected = selectedRows.length === filteredPromos.length && filteredPromos.length > 0
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < filteredPromos.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredPromos.map((p) => p.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id])
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleDelete = async () => {
    const count = selectedRows.length
    const { error } = await supabase
      .from('promo')
      .delete()
      .in('id', selectedRows)
    if (!error) {
      const updated = promos.filter(p => !selectedRows.includes(p.id))
      setPromos(updated)
      setSelectedRows([])
      toast.add({ title: `${count} promo berhasil dihapus`, type: "success" })
    } else {
      toast.add({ title: "Gagal menghapus promo", description: error.message, type: "error" })
    }
  }

  const handleAddClick = () => {
    setEditingId(null)
    setNewPromo({ title: "", promo: "", src: "" })
    setFileName("")
    setPromoFile(null)
    setIsDialogOpen(true)
  }

  const handleEditClick = (promo: any) => {
    setEditingId(promo.id)
    setNewPromo({ title: promo.title, promo: promo.promo, src: promo.src })
    setFileName("Gambar saat ini")
    setIsDialogOpen(true)
  }

  const handleSavePromo = async () => {
    if (newPromo.title && newPromo.promo && (newPromo.src || promoFile)) {
      setIsSaving(true)
      let srcUrl = newPromo.src
      if (promoFile) {
        const url = await uploadMedia(promoFile, 'promo')
        if (url) srcUrl = url
      }
      const payload = { title: newPromo.title, promo: newPromo.promo, src: srcUrl }
      if (editingId) {
        const { error } = await supabase
          .from('promo')
          .update(payload)
          .eq('id', editingId)
        if (!error) {
          setPromos(promos.map(p => p.id === editingId ? { ...p, ...payload } : p))
          toast.add({ title: "Promo berhasil diperbarui", type: "success" })
        } else {
          toast.add({ title: "Gagal mengedit promo", description: error.message, type: "error" })
        }
      } else {
        const { data, error } = await supabase
          .from('promo')
          .insert([payload])
          .select()
        if (data) {
          setPromos([...data, ...promos])
          toast.add({ title: "Promo baru berhasil ditambahkan", type: "success" })
        } else if (error) {
          toast.add({ title: "Gagal menambah promo", description: error.message, type: "error" })
        }
      }
      setPromoFile(null)
      setIsSaving(false)
      setIsDialogOpen(false)
    }
  }

  const handleDeleteProduk = async () => {
    const count = selectedProdukRows.length
    const { error } = await supabase
      .from('produk')
      .delete()
      .in('id', selectedProdukRows)
    if (!error) {
      const updated = produks.filter(p => !selectedProdukRows.includes(p.id))
      setProduks(updated)
      setSelectedProdukRows([])
      toast.add({ title: `${count} produk berhasil dihapus`, type: "success" })
    } else {
      toast.add({ title: "Gagal menghapus produk", description: error.message, type: "error" })
    }
  }

  const handleAddClickProduk = () => {
    setEditingProdukId(null)
    setNewProduk({ title: "", price: "", src: "" })
    setProdukFileName("")
    setProdukFile(null)
    setIsProdukDialogOpen(true)
  }

  const handleEditClickProduk = (produk: any) => {
    setEditingProdukId(produk.id)
    setNewProduk({ title: produk.title, price: produk.price, src: produk.src })
    setProdukFileName("Gambar saat ini")
    setIsProdukDialogOpen(true)
  }

  const handleSaveProduk = async () => {
    if (newProduk.title && newProduk.price && (newProduk.src || produkFile)) {
      setIsSavingProduk(true)
      let srcUrl = newProduk.src
      if (produkFile) {
        const url = await uploadMedia(produkFile, 'produk')
        if (url) srcUrl = url
      }
      const payload = { title: newProduk.title, price: newProduk.price, src: srcUrl }
      if (editingProdukId) {
        const { error } = await supabase
          .from('produk')
          .update(payload)
          .eq('id', editingProdukId)
        if (!error) {
          setProduks(produks.map(p => p.id === editingProdukId ? { ...p, ...payload } : p))
          toast.add({ title: "Produk berhasil diperbarui", type: "success" })
        } else {
          toast.add({ title: "Gagal mengedit produk", description: error.message, type: "error" })
        }
      } else {
        const { data, error } = await supabase
          .from('produk')
          .insert([payload])
          .select()
        if (data) {
          setProduks([...data, ...produks])
          toast.add({ title: "Produk baru berhasil ditambahkan", type: "success" })
        } else if (error) {
          toast.add({ title: "Gagal menambah produk", description: error.message, type: "error" })
        }
      }
      setProdukFile(null)
      setIsSavingProduk(false)
      setIsProdukDialogOpen(false)
    }
  }

  const isAllProdukSelected = selectedProdukRows.length === filteredProduks.length && filteredProduks.length > 0
  const handleSelectAllProduk = (checked: boolean) => {
    if (checked) {
      setSelectedProdukRows(filteredProduks.map((p) => p.id))
    } else {
      setSelectedProdukRows([])
    }
  }
  const handleSelectRowProduk = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProdukRows((prev) => [...prev, id])
    } else {
      setSelectedProdukRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const isAllPilihanSelected = selectedPilihanRows.length === filteredPilihans.length && filteredPilihans.length > 0

  const handleSelectAllPilihan = (checked: boolean) => {
    if (checked) {
      setSelectedPilihanRows(filteredPilihans.map((p) => p.id))
    } else {
      setSelectedPilihanRows([])
    }
  }

  const handleSelectRowPilihan = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPilihanRows((prev) => [...prev, id])
    } else {
      setSelectedPilihanRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleDeletePilihan = async () => {
    const count = selectedPilihanRows.length
    const { error } = await supabase
      .from('pilihan')
      .delete()
      .in('id', selectedPilihanRows)
    if (!error) {
      const updated = pilihans.filter(p => !selectedPilihanRows.includes(p.id))
      setPilihans(updated)
      setSelectedPilihanRows([])
      toast.add({ title: `${count} pilihan produk berhasil dihapus`, type: "success" })
    } else {
      toast.add({ title: "Gagal menghapus pilihan produk", description: error.message, type: "error" })
    }
  }

  const handleAddClickPilihan = () => {
    setEditingPilihanId(null)
    setNewPilihan({ title: "", price: "", src: "" })
    setPilihanFileName("")
    setPilihanFile(null)
    setIsPilihanDialogOpen(true)
  }

  const handleEditClickPilihan = (pilihan: any) => {
    setEditingPilihanId(pilihan.id)
    setNewPilihan({ title: pilihan.title, price: pilihan.price, src: pilihan.src })
    setPilihanFileName("Gambar saat ini")
    setIsPilihanDialogOpen(true)
  }

  const handleSavePilihan = async () => {
    if (newPilihan.title && newPilihan.price && (newPilihan.src || pilihanFile)) {
      setIsSavingPilihan(true)
      let srcUrl = newPilihan.src
      if (pilihanFile) {
        const url = await uploadMedia(pilihanFile, 'pilihan')
        if (url) srcUrl = url
      }
      const payload = { title: newPilihan.title, price: newPilihan.price, src: srcUrl }
      if (editingPilihanId) {
        const { error } = await supabase
          .from('pilihan')
          .update(payload)
          .eq('id', editingPilihanId)
        if (!error) {
          setPilihans(pilihans.map(p => p.id === editingPilihanId ? { ...p, ...payload } : p))
          toast.add({ title: "Pilihan produk berhasil diperbarui", type: "success" })
        } else {
          toast.add({ title: "Gagal mengedit pilihan produk", description: error.message, type: "error" })
        }
      } else {
        const { data, error } = await supabase
          .from('pilihan')
          .insert([payload])
          .select()
        if (data) {
          setPilihans([...data, ...pilihans])
          toast.add({ title: "Pilihan produk baru berhasil ditambahkan", type: "success" })
        } else if (error) {
          toast.add({ title: "Gagal menambah pilihan produk", description: error.message, type: "error" })
        }
      }
      setPilihanFile(null)
      setIsSavingPilihan(false)
      setIsPilihanDialogOpen(false)
    }
  }

  const isAllBannerSelected = selectedBannerRows.length === filteredBanners.length && filteredBanners.length > 0
  const handleSelectAllBanner = (checked: boolean) => {
    if (checked) {
      setSelectedBannerRows(filteredBanners.map((b) => b.id))
    } else {
      setSelectedBannerRows([])
    }
  }

  const handleSelectRowBanner = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedBannerRows((prev) => [...prev, id])
    } else {
      setSelectedBannerRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleDeleteBanner = async () => {
    const count = selectedBannerRows.length
    const { error } = await supabase
      .from('banner')
      .delete()
      .in('id', selectedBannerRows)
    if (!error) {
      const updated = banners.filter(b => !selectedBannerRows.includes(b.id))
      setBanners(updated)
      setSelectedBannerRows([])
      toast.add({ title: `${count} banner berhasil dihapus`, type: "success" })
    } else {
      toast.add({ title: "Gagal menghapus banner", description: error.message, type: "error" })
    }
  }

  const handleAddClickBanner = () => {
    setEditingBannerId(null)
    setNewBanner({ title: "", src: "" })
    setBannerFileName("")
    setBannerFile(null)
    setIsBannerDialogOpen(true)
  }

  const handleEditClickBanner = (banner: any) => {
    setEditingBannerId(banner.id)
    setNewBanner({ title: banner.title, src: banner.src })
    setBannerFileName("Gambar saat ini")
    setIsBannerDialogOpen(true)
  }

  const handleSaveBanner = async () => {
    if (newBanner.title && (newBanner.src || bannerFile)) {
      setIsSavingBanner(true)
      let srcUrl = newBanner.src
      if (bannerFile) {
        const url = await uploadMedia(bannerFile, 'banner')
        if (url) srcUrl = url
      }
      const payload = { title: newBanner.title, src: srcUrl }
      if (editingBannerId) {
        const { error } = await supabase
          .from('banner')
          .update(payload)
          .eq('id', editingBannerId)
        if (!error) {
          setBanners(banners.map(b => b.id === editingBannerId ? { ...b, ...payload } : b))
          toast.add({ title: "Banner berhasil diperbarui", type: "success" })
        } else {
          toast.add({ title: "Gagal mengedit banner", description: error.message, type: "error" })
        }
      } else {
        const { data, error } = await supabase
          .from('banner')
          .insert([payload])
          .select()
        if (data) {
          setBanners([...data, ...banners])
          toast.add({ title: "Banner baru berhasil ditambahkan", type: "success" })
        } else if (error) {
          toast.add({ title: "Gagal menambah banner", description: error.message, type: "error" })
        }
      }
      setBannerFile(null)
      setIsSavingBanner(false)
      setIsBannerDialogOpen(false)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8">
      <div className="flex flex-col">
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Pengaturan & Manajemen</h1>

      </div>

      <div className="flex flex-col gap-4 md:gap-4">
        {/* Top Grid Menu */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-none border transition-all",
                activeMenu === item.id
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent/50"
              )}
            >
              <item.icon className="w-8 h-8" />
              <span className="font-semibold text-sm md:text-base">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {activeMenu && (
          <div className="flex-1 w-full pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
            {activeMenu === 'promo' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Manajemen Promo</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari promo..."
                        value={searchPromoQuery}
                        onChange={(e) => {
                          setSearchPromoQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pr-9 h-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full justify-end sm:w-auto">
                      {selectedRows.length > 0 && (
                        <Button variant="secondary" onClick={handleDelete}>Hapus ({selectedRows.length})</Button>
                      )}
                      <Button onClick={handleAddClick}>Tambah Promo</Button>
                    </div>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl md:text-2xl">{editingId ? "Edit Promo" : "Tambah Promo Baru"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                      {/* Kolom Kiri: Form Input */}
                      <div className="flex flex-col gap-4 order-2 md:order-1">
                        <div className="grid w-full gap-2">
                          <Label htmlFor="title" className="text-base">Nama Promo</Label>
                          <Input
                            id="title"
                            value={newPromo.title}
                            onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                            placeholder="Misal: Minyak Goreng"
                            className="h-12"
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="promo" className="text-base">Keterangan</Label>
                          <Input
                            id="promo"
                            value={newPromo.promo}
                            onChange={(e) => setNewPromo({ ...newPromo, promo: e.target.value })}
                            placeholder="Misal: Diskon 20%"
                            className="h-12"
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="src" className="text-base">Upload Gambar</Label>
                          <div className="relative w-full h-12">
                            <Input
                              id="src"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setFileName(file.name)
                                  setPromoFile(file)
                                  // Show local preview
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setNewPromo({ ...newPromo, src: reader.result as string })
                                  }
                                  reader.readAsDataURL(file)
                                } else {
                                  setFileName("")
                                  setPromoFile(null)
                                  setNewPromo({ ...newPromo, src: "" })
                                }
                              }}
                              className="sr-only"
                            />
                            <Label
                              htmlFor="src"
                              className="cursor-pointer flex h-12 w-full items-center justify-between rounded-none border border-input bg-background px-4 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <span className={`truncate mr-2 font-normal text-base ${fileName ? "text-foreground" : "text-muted-foreground"}`}>
                                {fileName || "Tidak ada yang dipilih"}
                              </span>
                              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shrink-0">
                                Pilih File
                              </span>
                            </Label>
                          </div>
                        </div>
                        <div className="pt-4">
                          <Button onClick={handleSavePromo} className="h-12 w-full text-base" disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              editingId ? "Edit" : "Simpan Promo"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Kolom Kanan: Preview */}
                      <div className="flex flex-col items-center md:items-end justify-center w-full order-1 md:order-2 mb-2 md:mb-0">
                        <div className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] relative rounded-none border border-input overflow-hidden bg-muted/30 aspect-[4/5] shadow-sm">
                          {newPromo.src ? (
                            <img src={newPromo.src} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                              Pratinjau Gambar (4:5)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Mobile Card List */}
                <div className="flex flex-col gap-3 md:hidden">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-card border p-3 flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-none" />
                        <Skeleton className="w-16 h-20 rounded-none shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : filteredPromos.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-card border">
                      Tidak ada data promo.
                    </div>
                  ) : (
                    filteredPromos.slice((currentPage - 1) * 10, currentPage * 10).map((promo) => (
                      <div key={promo.id} className="bg-card border shadow-sm p-3 flex gap-3 relative">
                        <div className="flex items-center">
                          <Checkbox
                            checked={selectedRows.includes(promo.id)}
                            onCheckedChange={(c) => handleSelectRow(promo.id, !!c)}
                            aria-label={`Select ${promo.title}`}
                          />
                        </div>
                        <div className="w-16 h-20 shrink-0 cursor-pointer" onClick={() => handleEditClick(promo)}>
                          <img src={promo.src} alt={promo.title} className="w-full h-full object-cover rounded-none border" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div onClick={() => handleEditClick(promo)} className="cursor-pointer">
                            <div className="font-semibold text-foreground truncate text-sm">{promo.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{promo.promo}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2 border-t pt-2">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <Switch
                              checked={promo.is_active}
                              onCheckedChange={async (checked) => {
                                const { error } = await supabase.from('promo').update({ is_active: checked }).eq('id', promo.id)
                                if (!error) {
                                  setPromos(promos.map(p => p.id === promo.id ? { ...p, is_active: checked } : p))
                                  toast.add({ title: `Status promo ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                                } else {
                                  toast.add({ title: "Gagal memperbarui status promo", description: error.message, type: "error" })
                                }
                              }}
                              aria-label={`Toggle status ${promo.title}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block rounded-none border bg-card overflow-hidden justify-center items-center">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">
                          <Checkbox
                            aria-label="Select all"
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-[80px] text-center">Foto</TableHead>
                        <TableHead>Nama Promo</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-center w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: filteredPromos.length > 0 ? Math.min(filteredPromos.length, 10) : 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="w-12 h-[60px] rounded-none mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-none" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        filteredPromos.slice((currentPage - 1) * 10, currentPage * 10).map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell className="text-center">
                              <Checkbox
                                aria-label={`Select ${promo.title}`}
                                checked={selectedRows.includes(promo.id)}
                                onCheckedChange={(c) => handleSelectRow(promo.id, !!c)}
                              />
                            </TableCell>
                            <TableCell className="p-2 cursor-pointer hover:bg-accent/50" onClick={() => handleEditClick(promo)}>
                              <img
                                src={promo.src}
                                alt={promo.title}
                                className="w-12 h-[60px] rounded-none object-cover border mx-auto"
                              />
                            </TableCell>
                            <TableCell className="font-medium cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClick(promo)}>{promo.title}</TableCell>
                            <TableCell className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClick(promo)}>{promo.promo}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={promo.is_active}
                                onCheckedChange={async (checked) => {
                                  const { error } = await supabase.from('promo').update({ is_active: checked }).eq('id', promo.id)
                                  if (!error) {
                                    setPromos(promos.map(p => p.id === promo.id ? { ...p, is_active: checked } : p))
                                    toast.add({ title: `Status promo ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                                  } else {
                                    toast.add({ title: "Gagal memperbarui status promo", description: error.message, type: "error" })
                                  }
                                }}
                                aria-label={`Toggle status ${promo.title}`}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {!isLoading && filteredPromos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Tidak ada data promo.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-none border bg-card overflow-hidden shadow-sm mt-4 md:mt-0 md:border-t-0">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredPromos.length / 10)}
                    onPageChange={setCurrentPage}
                  />
                </div>

              </div>
            )}

            {activeMenu === 'pilihan' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Pilihan Hari Ini</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari pilihan..."
                        value={searchPilihanQuery}
                        onChange={(e) => {
                          setSearchPilihanQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pr-9 h-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full justify-end sm:w-auto">
                      {selectedPilihanRows.length > 0 && (
                        <Button variant="secondary" onClick={handleDeletePilihan}>Hapus ({selectedPilihanRows.length})</Button>
                      )}
                      <Button onClick={handleAddClickPilihan}>Tambah Produk</Button>
                    </div>
                  </div>
                </div>
                <Dialog open={isPilihanDialogOpen} onOpenChange={setIsPilihanDialogOpen}>
                  <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl md:text-2xl">{editingPilihanId ? "Edit Pilihan" : "Tambah Pilihan Baru"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                      {/* Kolom Kiri: Form Input */}
                      <div className="flex flex-col gap-4 order-2 md:order-1">
                        <div className="grid w-full gap-2">
                          <Label htmlFor="title" className="text-base">Nama Produk</Label>
                          <Input
                            id="title"
                            value={newPilihan.title}
                            onChange={(e) => setNewPilihan({ ...newPilihan, title: e.target.value })}
                            placeholder="Misal: Minyak Goreng"
                            className="h-12"
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="price" className="text-base">Harga</Label>
                          <Input
                            id="price"
                            value={newPilihan.price}
                            onChange={(e) => setNewPilihan({ ...newPilihan, price: formatRupiah(e.target.value) })}
                            placeholder="Misal: Rp 15.000"
                            className="h-12"
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="src" className="text-base">Upload Gambar</Label>
                          <div className="relative w-full h-12">
                            <Input
                              id="src"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setPilihanFileName(file.name)
                                  setPilihanFile(file)
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setNewPilihan({ ...newPilihan, src: reader.result as string })
                                  }
                                  reader.readAsDataURL(file)
                                } else {
                                  setPilihanFileName("")
                                  setPilihanFile(null)
                                  setNewPilihan({ ...newPilihan, src: "" })
                                }
                              }}
                              className="sr-only"
                            />
                            <Label
                              htmlFor="src"
                              className="cursor-pointer flex h-12 w-full items-center justify-between rounded-none border border-input bg-background px-4 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <span className={`truncate mr-2 font-normal text-base ${pilihanFileName ? "text-foreground" : "text-muted-foreground"}`}>
                                {pilihanFileName || "Tidak ada yang dipilih"}
                              </span>
                              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shrink-0">
                                Pilih File
                              </span>
                            </Label>
                          </div>
                        </div>
                        <div className="pt-4">
                          <Button onClick={handleSavePilihan} className="h-12 w-full text-base" disabled={isSavingPilihan}>
                            {isSavingPilihan ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              editingPilihanId ? "Edit" : "Simpan Pilihan"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Kolom Kanan: Preview */}
                      <div className="flex flex-col items-center md:items-end justify-center w-full order-1 md:order-2 mb-2 md:mb-0">
                        <div className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] relative rounded-none border border-input overflow-hidden bg-muted/30 aspect-[4/5] shadow-sm">
                          {newPilihan.src ? (
                            <img src={newPilihan.src} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                              Pratinjau Gambar (4:5)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Mobile Card List */}
                <div className="flex flex-col gap-3 md:hidden">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-card border p-3 flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-none" />
                        <Skeleton className="w-16 h-20 rounded-none shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : filteredPilihans.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-card border">
                      Tidak ada data pilihan.
                    </div>
                  ) : (
                    filteredPilihans.slice((currentPage - 1) * 10, currentPage * 10).map((pilihan) => (
                      <div key={pilihan.id} className="bg-card border shadow-sm p-3 flex gap-3 relative">
                        <div className="flex items-center">
                          <Checkbox
                            checked={selectedPilihanRows.includes(pilihan.id)}
                            onCheckedChange={(c) => handleSelectRowPilihan(pilihan.id, !!c)}
                            aria-label={`Select ${pilihan.title}`}
                          />
                        </div>
                        <div className="w-16 h-20 shrink-0 cursor-pointer" onClick={() => handleEditClickPilihan(pilihan)}>
                          <img src={pilihan.src} alt={pilihan.title} className="w-full h-full object-cover rounded-none border" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div onClick={() => handleEditClickPilihan(pilihan)} className="cursor-pointer">
                            <div className="font-semibold text-foreground truncate text-sm">{pilihan.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{pilihan.price}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2 border-t pt-2">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <Switch
                              checked={pilihan.is_active}
                              onCheckedChange={async (checked) => {
                                const { error } = await supabase.from('pilihan').update({ is_active: checked }).eq('id', pilihan.id)
                                if (!error) {
                                  setPilihans(pilihans.map(p => p.id === pilihan.id ? { ...p, is_active: checked } : p))
                                  toast.add({ title: `Status pilihan produk ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                                } else {
                                  toast.add({ title: "Gagal memperbarui status pilihan produk", description: error.message, type: "error" })
                                }
                              }}
                              aria-label={`Toggle status ${pilihan.title}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block rounded-none border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">
                          <Checkbox
                            aria-label="Select all"
                            checked={isAllPilihanSelected}
                            onCheckedChange={handleSelectAllPilihan}
                          />
                        </TableHead>
                        <TableHead className="w-[80px] text-center">Foto</TableHead>
                        <TableHead>Nama Produk</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead className="text-center w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: filteredPilihans.length > 0 ? Math.min(filteredPilihans.length, 10) : 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="w-12 h-[60px] rounded-none mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-none" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        filteredPilihans.slice((currentPage - 1) * 10, currentPage * 10).map((pilihan) => (
                          <TableRow key={pilihan.id}>
                            <TableCell className="text-center">
                              <Checkbox
                                aria-label={`Select ${pilihan.title}`}
                                checked={selectedPilihanRows.includes(pilihan.id)}
                                onCheckedChange={(c) => handleSelectRowPilihan(pilihan.id, !!c)}
                              />
                            </TableCell>
                            <TableCell className="p-2 cursor-pointer hover:bg-accent/50" onClick={() => handleEditClickPilihan(pilihan)}>
                              <img
                                src={pilihan.src}
                                alt={pilihan.title}
                                className="w-12 h-[60px] rounded-none object-cover border mx-auto"
                              />
                            </TableCell>
                            <TableCell className="font-medium cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClickPilihan(pilihan)}>{pilihan.title}</TableCell>
                            <TableCell className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClickPilihan(pilihan)}>{pilihan.price}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={pilihan.is_active}
                                onCheckedChange={async (checked) => {
                                  const { error } = await supabase.from('pilihan').update({ is_active: checked }).eq('id', pilihan.id)
                                  if (!error) {
                                    setPilihans(pilihans.map(p => p.id === pilihan.id ? { ...p, is_active: checked } : p))
                                    toast.add({ title: `Status pilihan produk ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                                  } else {
                                    toast.add({ title: "Gagal memperbarui status pilihan produk", description: error.message, type: "error" })
                                  }
                                }}
                                aria-label={`Toggle status ${pilihan.title}`}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {!isLoading && filteredPilihans.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Tidak ada data pilihan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="rounded-none border bg-card overflow-hidden shadow-sm mt-4 md:mt-0 md:border-t-0">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredPilihans.length / 10)}
                    onPageChange={setCurrentPage}
                  />
                </div>

              </div>
            )}

            {activeMenu === 'produk' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Manajemen Produk</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari produk..."
                        value={searchProdukQuery}
                        onChange={(e) => {
                          setSearchProdukQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pr-9 h-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full justify-end sm:w-auto">
                      {selectedProdukRows.length > 0 && (
                        <Button variant="secondary" onClick={handleDeleteProduk}>Hapus ({selectedProdukRows.length})</Button>
                      )}
                      <Button onClick={handleAddClickProduk}>Tambah Produk</Button>
                    </div>
                  </div>
                </div>
                <Dialog open={isProdukDialogOpen} onOpenChange={setIsProdukDialogOpen}>
                  <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl md:text-2xl">{editingProdukId ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                      <div className="flex flex-col gap-4 order-2 md:order-1">
                        <div className="grid w-full gap-2">
                          <Label htmlFor="produk-title" className="text-base">Nama Produk</Label>
                          <Input
                            id="produk-title"
                            value={newProduk.title}
                            onChange={(e) => setNewProduk({ ...newProduk, title: e.target.value })}
                            placeholder="Misal: Minyak Goreng"
                            className="h-12"
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="produk-price" className="text-base">Harga</Label>
                          <Input
                            id="produk-price"
                            value={newProduk.price}
                            onChange={(e) => setNewProduk({ ...newProduk, price: formatRupiah(e.target.value) })}
                            placeholder="Misal: Rp 15.000"
                            className="h-12"
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="produk-src" className="text-base">Upload Gambar</Label>
                          <div className="relative w-full h-12">
                            <Input
                              id="produk-src"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setProdukFileName(file.name)
                                  setProdukFile(file)
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setNewProduk({ ...newProduk, src: reader.result as string })
                                  }
                                  reader.readAsDataURL(file)
                                } else {
                                  setProdukFileName("")
                                  setProdukFile(null)
                                  setNewProduk({ ...newProduk, src: "" })
                                }
                              }}
                              className="sr-only"
                            />
                            <Label
                              htmlFor="produk-src"
                              className="cursor-pointer flex h-12 w-full items-center justify-between rounded-none border border-input bg-background px-4 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <span className={`truncate mr-2 font-normal text-base ${produkFileName ? "text-foreground" : "text-muted-foreground"}`}>
                                {produkFileName || "Tidak ada yang dipilih"}
                              </span>
                              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shrink-0">
                                Pilih File
                              </span>
                            </Label>
                          </div>
                        </div>
                        <div className="pt-4">
                          <Button onClick={handleSaveProduk} className="h-12 w-full text-base" disabled={isSavingProduk}>
                            {isSavingProduk ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              editingProdukId ? "Edit" : "Simpan Produk"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end justify-center w-full order-1 md:order-2 mb-2 md:mb-0">
                        <div className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] relative rounded-none border border-input overflow-hidden bg-muted/30 aspect-[4/5] shadow-sm">
                          {newProduk.src ? (
                            <img src={newProduk.src} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                              Pratinjau Gambar (4:5)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Mobile Card List */}
                <div className="flex flex-col gap-3 md:hidden">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-card border p-3 flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-none" />
                        <Skeleton className="w-16 h-20 rounded-none shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : filteredProduks.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-card border">
                      Tidak ada data produk yang cocok.
                    </div>
                  ) : (
                    filteredProduks.slice((currentPage - 1) * 10, currentPage * 10).map((produk) => (
                      <div key={produk.id} className="bg-card border shadow-sm p-3 flex gap-3 relative">
                        <div className="flex items-center">
                          <Checkbox
                            checked={selectedProdukRows.includes(produk.id)}
                            onCheckedChange={(c) => handleSelectRowProduk(produk.id, !!c)}
                            aria-label={`Select ${produk.title}`}
                          />
                        </div>
                        <div className="w-16 h-20 shrink-0 cursor-pointer" onClick={() => handleEditClickProduk(produk)}>
                          <img src={produk.src} alt={produk.title} className="w-full h-full object-cover rounded-none border" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div onClick={() => handleEditClickProduk(produk)} className="cursor-pointer">
                            <div className="font-semibold text-foreground truncate text-sm">{produk.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{produk.price}</div>
                          </div>
                          <div className="flex items-center justify-between mt-2 border-t pt-2">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <Switch
                              checked={produk.is_active}
                              onCheckedChange={async (checked) => {
                                const { error } = await supabase.from('produk').update({ is_active: checked }).eq('id', produk.id)
                                if (!error) {
                                  setProduks(produks.map(p => p.id === produk.id ? { ...p, is_active: checked } : p))
                                  toast.add({ title: `Status produk ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                                } else {
                                  toast.add({ title: "Gagal memperbarui status produk", description: error.message, type: "error" })
                                }
                              }}
                              aria-label={`Toggle status ${produk.title}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block rounded-none border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">
                          <Checkbox
                            aria-label="Select all"
                            checked={isAllProdukSelected}
                            onCheckedChange={handleSelectAllProduk}
                          />
                        </TableHead>
                        <TableHead className="w-[80px] text-center">Foto</TableHead>
                        <TableHead>Nama Produk</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead className="text-center w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: filteredProduks.length > 0 ? Math.min(filteredProduks.length, 10) : 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="w-12 h-[60px] rounded-none mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-none" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        filteredProduks.slice((currentPage - 1) * 10, currentPage * 10).map((produk) => (
                          <TableRow key={produk.id}>
                            <TableCell className="text-center">
                              <Checkbox
                                aria-label={`Select ${produk.title}`}
                                checked={selectedProdukRows.includes(produk.id)}
                                onCheckedChange={(c) => handleSelectRowProduk(produk.id, !!c)}
                              />
                            </TableCell>
                            <TableCell className="p-2 cursor-pointer hover:bg-accent/50" onClick={() => handleEditClickProduk(produk)}>
                              <img
                                src={produk.src}
                                alt={produk.title}
                                className="w-12 h-[60px] rounded-none object-cover border mx-auto"
                              />
                            </TableCell>
                            <TableCell className="font-medium cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClickProduk(produk)}>{produk.title}</TableCell>
                            <TableCell className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClickProduk(produk)}>{produk.price}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={produk.is_active}
                                onCheckedChange={async (checked) => {
                                  const { error } = await supabase.from('produk').update({ is_active: checked }).eq('id', produk.id)
                                  if (!error) {
                                    setProduks(produks.map(p => p.id === produk.id ? { ...p, is_active: checked } : p))
                                    toast.add({ title: `Status produk ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                                  } else {
                                    toast.add({ title: "Gagal memperbarui status produk", description: error.message, type: "error" })
                                  }
                                }}
                                aria-label={`Toggle status ${produk.title}`}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {!isLoading && filteredProduks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Tidak ada data produk yang cocok.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="rounded-none border bg-card overflow-hidden shadow-sm mt-4 md:mt-0 md:border-t-0">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredProduks.length / 10)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
            {activeMenu === 'banner' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Manajemen Banner</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari banner..."
                        value={searchBannerQuery}
                        onChange={(e) => {
                          setSearchBannerQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pr-9 h-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full justify-end sm:w-auto">
                      {selectedBannerRows.length > 0 && (
                        <Button variant="secondary" onClick={handleDeleteBanner}>Hapus ({selectedBannerRows.length})</Button>
                      )}
                      <Button onClick={handleAddClickBanner}>Tambah Banner</Button>
                    </div>
                  </div>
                </div>
                <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
                  <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl md:text-2xl">{editingBannerId ? "Edit Banner" : "Tambah Banner Baru"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                      {/* Kolom Kiri: Form Input */}
                      <div className="flex flex-col gap-4 order-2 md:order-1">
                        <div className="grid w-full gap-2">
                          <Label htmlFor="banner-title" className="text-base">Nama / Judul Banner</Label>
                          <Input
                            id="banner-title"
                            value={newBanner.title}
                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                            placeholder="Misal: Promo Akhir Tahun"
                            className="h-12"
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="banner-src" className="text-base">Upload Gambar Banner</Label>
                          <div className="relative w-full h-12">
                            <Input
                              id="banner-src"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setBannerFileName(file.name)
                                  setBannerFile(file)
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setNewBanner({ ...newBanner, src: reader.result as string })
                                  }
                                  reader.readAsDataURL(file)
                                } else {
                                  setBannerFileName("")
                                  setBannerFile(null)
                                  setNewBanner({ ...newBanner, src: "" })
                                }
                              }}
                              className="sr-only"
                            />
                            <Label
                              htmlFor="banner-src"
                              className="cursor-pointer flex h-12 w-full items-center justify-between rounded-none border border-input bg-background px-4 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                              <span className={`truncate mr-2 font-normal text-base ${bannerFileName ? "text-foreground" : "text-muted-foreground"}`}>
                                {bannerFileName || "Tidak ada yang dipilih"}
                              </span>
                              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shrink-0">
                                Pilih File
                              </span>
                            </Label>
                          </div>
                        </div>
                        <div className="pt-4">
                          <Button onClick={handleSaveBanner} className="h-12 w-full text-base" disabled={isSavingBanner}>
                            {isSavingBanner ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Menyimpan...
                              </>
                            ) : (
                              editingBannerId ? "Edit" : "Simpan Banner"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Kolom Kanan: Preview */}
                      <div className="flex flex-col items-center md:items-end justify-center w-full order-1 md:order-2 mb-2 md:mb-0">
                        <div className="w-full relative rounded-none border border-input overflow-hidden bg-muted/30 aspect-[2/1] shadow-sm">
                          {newBanner.src ? (
                            <img src={newBanner.src} alt="Preview Banner" className="w-full h-full object-cover absolute inset-0" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                              Pratinjau Banner Canva (2:1 / 1000x500mm)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Mobile Card List */}
                <div className="flex flex-col gap-3 md:hidden">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-card border p-3 flex gap-3">
                        <Skeleton className="w-5 h-5 rounded-none" />
                        <Skeleton className="w-24 h-12 rounded-none shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))
                  ) : filteredBanners.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-card border">
                      Tidak ada data banner.
                    </div>
                  ) : (
                    filteredBanners.slice((currentPage - 1) * 10, currentPage * 10).map((banner) => (
                      <div key={banner.id} className="bg-card border shadow-sm p-3 flex gap-3 relative flex-col">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center mt-1">
                            <Checkbox
                              checked={selectedBannerRows.includes(banner.id)}
                              onCheckedChange={(c) => handleSelectRowBanner(banner.id, !!c)}
                              aria-label={`Select ${banner.title}`}
                            />
                          </div>
                          <div className="w-24 h-12 shrink-0 cursor-pointer" onClick={() => handleEditClickBanner(banner)}>
                            <img src={banner.src} alt={banner.title} className="w-full h-full object-cover rounded-none border" />
                          </div>
                          <div className="flex flex-1 flex-col justify-center min-w-0">
                            <div onClick={() => handleEditClickBanner(banner)} className="cursor-pointer">
                              <div className="font-semibold text-foreground truncate text-sm line-clamp-2">{banner.title}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 border-t pt-2">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Switch
                            checked={banner.is_active}
                            onCheckedChange={async (checked) => {
                              const { error } = await supabase.from('banner').update({ is_active: checked }).eq('id', banner.id)
                              if (!error) {
                                setBanners(banners.map(b => b.id === banner.id ? { ...b, is_active: checked } : b))
                                toast.add({ title: `Status banner ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                              } else {
                                toast.add({ title: "Gagal memperbarui status banner", description: error.message, type: "error" })
                              }
                            }}
                            aria-label={`Toggle status ${banner.title}`}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block rounded-none border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center">
                          <Checkbox
                            aria-label="Select all"
                            checked={isAllBannerSelected}
                            onCheckedChange={handleSelectAllBanner}
                          />
                        </TableHead>
                        <TableHead className="w-[160px] text-center">Foto Banner</TableHead>
                        <TableHead>Nama / Judul Banner</TableHead>
                        <TableHead className="text-center w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: filteredBanners.length > 0 ? Math.min(filteredBanners.length, 10) : 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                            <TableCell><Skeleton className="w-28 h-14 rounded-none mx-auto" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-none" /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        filteredBanners.slice((currentPage - 1) * 10, currentPage * 10).map((banner) => (
                          <TableRow key={banner.id}>
                            <TableCell className="text-center">
                              <Checkbox
                                aria-label={`Select ${banner.title}`}
                                checked={selectedBannerRows.includes(banner.id)}
                                onCheckedChange={(c) => handleSelectRowBanner(banner.id, !!c)}
                              />
                            </TableCell>
                            <TableCell className="p-2 cursor-pointer hover:bg-accent/50" onClick={() => handleEditClickBanner(banner)}>
                              <img
                                src={banner.src}
                                alt={banner.title}
                                className="w-28 h-14 rounded-none object-cover border mx-auto"
                              />
                            </TableCell>
                            <TableCell className="font-medium cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClickBanner(banner)}>
                              {banner.title}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={banner.is_active}
                                onCheckedChange={async (checked) => {
                                  const { error } = await supabase.from('banner').update({ is_active: checked }).eq('id', banner.id)
                                  if (!error) {
                                    setBanners(banners.map(b => b.id === banner.id ? { ...b, is_active: checked } : b))
                                    toast.add({ title: `Status banner ${checked ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
                                  } else {
                                    toast.add({ title: "Gagal memperbarui status banner", description: error.message, type: "error" })
                                  }
                                }}
                                aria-label={`Toggle status ${banner.title}`}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {!isLoading && filteredBanners.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            Tidak ada data banner.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="rounded-none border bg-card overflow-hidden shadow-sm mt-4 md:mt-0 md:border-t-0">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredBanners.length / 10)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

