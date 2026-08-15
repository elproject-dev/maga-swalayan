"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"

const galleryImages = [
  { id: 1, title: "Sayur Segar", promo: "Diskon 20%", src: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&h=400&fit=crop" },
  { id: 2, title: "Bumbu Dapur", promo: "Beli 2 Gratis 1", src: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=400&fit=crop" },
  { id: 3, title: "Produk Susu", promo: "Hemat Rp 5.000", src: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&h=400&fit=crop" },
  { id: 4, title: "Perawatan Tubuh", promo: "Diskon Up To 50%", src: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=400&fit=crop" },
  { id: 5, title: "Camilan Sehat", promo: "Promo Akhir Pekan", src: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&h=400&fit=crop" },
  { id: 6, title: "Minuman Dingin", promo: "Beli 1 Gratis 1", src: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop" },
  { id: 7, title: "Alat Kebersihan", promo: "Diskon 10%", src: "https://images.unsplash.com/photo-1584824486509-112e4181f1ce?w=600&h=400&fit=crop" },
  { id: 8, title: "Kebutuhan Bayi", promo: "Harga Spesial", src: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=400&fit=crop" },
];

export default function PromoPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [images, setImages] = useState<any[]>(galleryImages)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPromos = async () => {
      const { data, error } = await supabase
        .from('promo')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })
      if (data) {
        setImages(data)
      } else {
        setImages(galleryImages)
      }
      setIsMounted(true);
    }
    fetchPromos()
  }, [])

  if (!isMounted) {
    return <LoadingSpinner text="Memuat promo..." />
  }

  const filteredImages = images.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      item.promo.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-none object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="@container/main flex flex-1 flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-4 py-4 md:gap-4 md:py-6 px-4 lg:px-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Semua Promo</h1>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari promo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-4">
            {filteredImages.map((item) => (
              <Card key={item.id} onClick={() => setSelectedImage(item.src)} className="overflow-hidden border-none shadow-sm rounded-none p-0 group cursor-pointer relative aspect-[4/5] transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-xl">
                <img
                  src={item.src}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 flex flex-col pointer-events-none">
                  <div className="w-full border-t border-white/30 pt-3 flex flex-col gap-1">
                    <h3 className="text-white text-sm md:text-base font-semibold line-clamp-1 drop-shadow-md">
                      {item.title}
                    </h3>
                    <p className="text-yellow-400 text-xs md:text-sm font-bold drop-shadow-md">
                      {item.promo}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {filteredImages.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Tidak ada promo yang cocok dengan pencarian Anda.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
