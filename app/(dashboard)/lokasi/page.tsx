"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Clock, Navigation } from "lucide-react"

const storeLocations = [
  {
    id: 1,
    name: "Maga Swalayan Pusat",
    address: "Jl. Magelang Km 5, Sleman, DI Yogyakarta",
    phone: "0274-123456",
    hours: "08:00 - 22:00",
    mapsUrl: "https://maps.google.com/?q=Yogyakarta",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Maga Swalayan Gejayan",
    address: "Jl. Gejayan No. 12, Depok, Sleman, DI Yogyakarta",
    phone: "0274-654321",
    hours: "07:30 - 22:00",
    mapsUrl: "https://maps.google.com/?q=Yogyakarta",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop"
  },
  {
    id: 3,
    name: "Maga Swalayan Bantul",
    address: "Jl. Bantul Km 7, Sewon, Bantul, DI Yogyakarta",
    phone: "0274-789012",
    hours: "08:00 - 21:30",
    mapsUrl: "https://maps.google.com/?q=Yogyakarta",
    image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&h=400&fit=crop"
  }
]

export default function LokasiPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lokasi Toko</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Temukan cabang Maga Swalayan terdekat di kota Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {storeLocations.map((store) => (
          <Card key={store.id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all group rounded-2xl">
            <div className="relative h-48 overflow-hidden bg-muted">
              <img 
                src={store.image} 
                alt={store.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white drop-shadow-md">{store.name}</h3>
              </div>
            </div>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/90">{store.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-sm text-foreground/90">{store.hours}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-sm text-foreground/90">{store.phone}</p>
              </div>
              
              <a 
                href={store.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-colors text-sm font-semibold"
              >
                <Navigation className="w-4 h-4" />
                Petunjuk Arah
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
