"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselDots } from "@/components/ui/carousel"
import { Loader2 } from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"

const defaultPromoBanners = [
  {
    id: 1,
    title: "Diskon Kebutuhan Harian",
    src: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Promo Buah Segar",
    src: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop",
  },
]

function CarouselDemo({ banners }: { banners: any[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  const rawBanners = banners && banners.length > 0 ? banners : defaultPromoBanners

  const displayBanners = React.useMemo(() => {
    if (rawBanners.length === 1) return rawBanners
    if (rawBanners.length < 4) {
      return [...rawBanners, ...rawBanners]
    }
    return rawBanners
  }, [rawBanners])

  return (
    <Carousel
      opts={{
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full relative"
    >
      <CarouselContent>
        {displayBanners.map((banner, index) => (
          <CarouselItem key={`${banner.id}-${index}`}>
            <div className="relative flex h-52 sm:h-60 md:h-64 lg:h-72 xl:h-80 w-full items-center justify-center rounded-none overflow-hidden shadow-sm border border-border/40 bg-card group isolate transform-gpu [webkit-mask-image:-webkit-radial-gradient(white,black)] [mask-image:radial-gradient(white,black)]">
              <img
                src={banner.src}
                alt={banner.title || "Banner"}
                className="absolute inset-0 w-full h-full object-cover object-center rounded-none transition-transform duration-500 group-hover:scale-102 transform-gpu"
              />
              {banner.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 md:p-6 rounded-none">
                  <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-tight drop-shadow-md">
                    {banner.title}
                  </h2>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-3 flex justify-center w-full">
        <CarouselDots realCount={rawBanners.length} />
      </div>
    </Carousel>
  )
}

function PromoGallery({ promos }: { promos: any[] }) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-none object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-4">
        {promos.map((item) => (
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
        {promos.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Belum ada data promo saat ini.
          </div>
        )}
      </div>
    </>
  )
}

function PilihanHariIniGallery({ items }: { items: any[] }) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-none object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <Card key={item.id} onClick={() => setSelectedImage(item.src)} className="overflow-hidden border-none shadow-sm rounded-none p-0 group cursor-pointer relative aspect-[4/5] transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-xl">
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
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Belum ada pilihan produk saat ini.
          </div>
        )}
      </div>
    </>
  )
}

export default function Page() {
  const [banners, setBanners] = React.useState<any[]>([])
  const [promos, setPromos] = React.useState<any[]>(defaultPromoBanners)
  const [pilihans, setPilihans] = React.useState<any[]>(defaultPromoBanners)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: bannerData } = await supabase
        .from('banner')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })
      if (bannerData) setBanners(bannerData)

      const { data: promosData } = await supabase
        .from('promo')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })
      if (promosData) setPromos(promosData)

      const { data: pilihansData } = await supabase
        .from('pilihan')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })
      if (pilihansData) setPilihans(pilihansData)

      setIsLoading(false)
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <LoadingSpinner text="Memuat dashboard..." />
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 py-4 md:gap-4 md:py-6">
        <div className="px-4 lg:px-6">
          <CarouselDemo banners={banners} />
        </div>
        <div className="px-4 lg:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Promo Hari Ini</h2>
            <a href="/promo" className="text-sm font-medium text-primary hover:underline">
              Lihat Semua
            </a>
          </div>
          <PromoGallery promos={promos} />
        </div>

        <div className="px-4 lg:px-6 pt-2 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Pilihan Hari Ini</h2>
            <a href="/pilihan" className="text-sm font-medium text-primary hover:underline">
              Lihat Semua
            </a>
          </div>
          <PilihanHariIniGallery items={pilihans} />
        </div>

      </div>
    </div>
  )
}
