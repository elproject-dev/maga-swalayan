"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import { SkeletonGrid } from "@/components/skeleton-grid"
import { Input } from "@/components/ui/input"

import { Dialog, DialogContent } from "@/components/ui/dialog"

import { supabase } from "@/lib/supabase"

const dummyProdukHariIni = [
  { id: 1, title: "Minyak Goreng 2L", price: "Rp 32.500", src: "https://images.unsplash.com/photo-1620021508207-1d575cde0440?w=400&h=400&fit=crop" },
  { id: 2, title: "Beras Premium 5kg", price: "Rp 68.000", src: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400&h=400&fit=crop" },
  { id: 3, title: "Gula Pasir 1kg", price: "Rp 15.000", src: "https://images.unsplash.com/photo-1622485501177-3e6f98725f0a?w=400&h=400&fit=crop" },
  { id: 4, title: "Susu UHT 1L", price: "Rp 18.500", src: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop" },
  { id: 5, title: "Telur Ayam 1kg", price: "Rp 27.000", src: "https://images.unsplash.com/photo-1506976773554-152e46b8d4f4?w=400&h=400&fit=crop" },
  { id: 6, title: "Mie Instan Goreng", price: "Rp 3.000", src: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&h=400&fit=crop" },
]

export default function ProdukPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [produks, setProduks] = useState<any[]>(dummyProdukHariIni)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduks = async () => {
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })
      if (data) {
        setProduks(data)
      } else {
        setProduks(dummyProdukHariIni)
      }
      setIsMounted(true)
    }
    fetchProduks()
  }, [])

  if (!isMounted) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Produk Hari Ini</h1>
          </div>
          <SkeletonGrid count={10} />
        </div>
      </div>
    )
  }

  const filteredProduks = produks.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      item.price.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Produk Hari Ini</h1>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProduks.map((item) => (
            <Card key={item.id} onClick={() => setSelectedImage(item.src)} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">
              <img
                src={item.src}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

              <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col pointer-events-none">
                <div className="w-full border-t border-white/30 pt-2 flex flex-col gap-1">
                  <h3 className="text-white text-sm font-medium line-clamp-2 drop-shadow-md leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-yellow-400 text-sm font-bold drop-shadow-md">
                    {item.price}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          {filteredProduks.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Tidak ada produk yang cocok dengan pencarian Anda.
            </div>
          )}
        </div>

      </div>
    </div>
    </>
  )
}
