"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function LokasiPage() {
  const [storeLocations, setStoreLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from('lokasi').select('*').order('id', { ascending: true })
      if (data) {
        setStoreLocations(data)
      }
      setIsLoading(false)
    }
    fetchLocations()
  }, [])

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Lokasi Toko</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Temukan cabang Maga Swalayan terdekat di kota Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : storeLocations.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg bg-card shadow-sm">
            Belum ada data lokasi toko.
          </div>
        ) : (
          storeLocations.map((store) => (
            <Card key={store.id} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-all rounded-none group">
              <div className="relative h-48 overflow-hidden bg-muted">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-5 flex flex-col gap-3 rounded-none">
                <h3 className="text-xl font-bold">{store.name}</h3>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-yellow-500">Alamat</p>
                  <p className="text-sm text-foreground/90">{store.address}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-yellow-500">Jam Buka</p>
                  <p className="text-sm text-foreground/90">{store.hours}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-yellow-500">Telepon</p>
                  <p className="text-sm text-foreground/90">{store.phone}</p>
                </div>

                <a
                  href={store.maps_url || store.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-center w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white transition-colors text-sm font-bold rounded-none"
                >
                  Petunjuk Arah
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
