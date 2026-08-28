"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Search, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { LoadingSpinner } from "@/components/loading-spinner"



export default function PilihanPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false }) // Event terbaru di atas
      if (data) {
        setEvents(data)
      }
      setIsMounted(true)
    }
    fetchEvents()
  }, [])

  if (!isMounted) {
    return <LoadingSpinner text="Memuat event..." />
  }

  const filteredEvents = events.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    )
  })

  // Format tanggal sederhana
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Baru saja"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  }

  return (
    <>
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="w-[95vw] max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-none border-none">
          {selectedEvent && (
            <div className="flex flex-col">
              <div className="relative w-full aspect-[2/1] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedEvent.src} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-6">
                <DialogTitle className="text-2xl font-bold mb-2 leading-tight">
                  {selectedEvent.title}
                </DialogTitle>
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {formatDate(selectedEvent.created_at)}
                </div>
                <DialogDescription className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description || "Tidak ada deskripsi rinci untuk event ini."}
                </DialogDescription>
                <div className="mt-8 flex justify-end">
                  <Button onClick={() => setSelectedEvent(null)} className="rounded-none">Tutup</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="@container/main flex flex-1 flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-8 max-w-4xl mx-auto w-full">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Info & Event Terbaru</h1>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 rounded-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {filteredEvents.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden border shadow-sm rounded-none bg-card hover:shadow-md transition-shadow duration-300 flex flex-col p-0 gap-0"
              >
                {/* Banner Image */}
                <div 
                  className="w-full aspect-[2/1] bg-muted relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedEvent(item)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                
                {/* Content */}
                <div className="p-5 md:p-6 flex flex-col gap-3">
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                    {formatDate(item.created_at)}
                  </div>
                  
                  <h3 
                    className="text-xl md:text-2xl font-bold leading-tight cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setSelectedEvent(item)}
                  >
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm md:text-base line-clamp-2 leading-relaxed">
                    {item.description || "Klik untuk membaca selengkapnya mengenai info ini."}
                  </p>
                  
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      className="px-0 text-primary font-semibold h-auto rounded-none"
                      onClick={() => setSelectedEvent(item)}
                    >
                      Baca selengkapnya &rarr;
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-none border border-dashed">
                <p>Tidak ada event yang cocok dengan pencarian Anda.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
