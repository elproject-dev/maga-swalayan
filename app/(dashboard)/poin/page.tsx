"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Trash2, Search, Coins, Award } from "lucide-react"

import { TablePagination } from "@/components/table-pagination"

import { supabase } from "@/lib/supabase"

import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"

const dummyPointsData = [
  { id: 1, name: "Budi Santoso", phone: "081234567890", points: 1500, lastUpdated: "2026-08-12", status: "Aktif" },
  { id: 2, name: "Siti Aminah", phone: "081298765432", points: 450, lastUpdated: "2026-08-11", status: "Aktif" },
  { id: 3, name: "Andi Wijaya", phone: "081345678912", points: 0, lastUpdated: "2026-08-10", status: "Non-Aktif" },
  { id: 4, name: "Dewi Lestari", phone: "085612345678", points: 3200, lastUpdated: "2026-08-12", status: "Aktif" },
  { id: 5, name: "Rudi Hermawan", phone: "089698761234", points: 120, lastUpdated: "2026-08-09", status: "Non-Aktif" },
  { id: 6, name: "Indah Permatasari", phone: "087711223344", points: 890, lastUpdated: "2026-08-12", status: "Aktif" },
  { id: 7, name: "Toko Makmur (Grosir)", phone: "082255667788", points: 12500, lastUpdated: "2026-08-12", status: "Aktif" },
]

export default function PoinPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [poinList, setPoinList] = useState<any[]>(dummyPointsData)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isActionMode, setIsActionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPoin = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('poin')
      .select('*')
      .order('id', { ascending: true })
    if (data) {
      setPoinList(data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        points: item.points,
        lastUpdated: item.last_updated,
        status: item.status
      })))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsMounted(true)
    fetchPoin()
  }, [])

  const filteredPoin = poinList.filter((p) => {
    const q = searchQuery.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.phone.includes(q)
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredPoin.map((c) => c.id))
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
    const { error } = await supabase
      .from('poin')
      .delete()
      .in('id', selectedRows)
    if (!error) {
      setPoinList(poinList.filter(c => !selectedRows.includes(c.id)))
      setSelectedRows([])
      setIsActionMode(false)
    }
  }

  const isAllSelected = selectedRows.length === filteredPoin.length && filteredPoin.length > 0

  const toggleStatus = async (id: number) => {
    const poin = poinList.find(p => p.id === id)
    if (!poin) return
    const newStatus = poin.status === "Aktif" ? "Non-Aktif" : "Aktif"
    const { error } = await supabase
      .from('poin')
      .update({ status: newStatus })
      .eq('id', id)
    if (!error) {
      setPoinList(poinList.map(p =>
        p.id === id ? { ...p, status: newStatus } : p
      ))
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">

          <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Poin Pelanggan</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau no. telp..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          {isActionMode ? (
            <>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={selectedRows.length === 0}
              >

                Hapus Terpilih ({selectedRows.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsActionMode(false)
                  setSelectedRows([])
                }}
              >
                Batal
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsActionMode(true)}>
              Aksi
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-between pt-3 border-t">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-6 w-12 rounded-none" />
              </div>
            </div>
          ))
        ) : filteredPoin.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card border">
            Tidak ada data poin yang cocok.
          </div>
        ) : (
          filteredPoin.slice((currentPage - 1) * 10, currentPage * 10).map((poin) => (
            <div 
              key={poin.id} 
              className="bg-card border shadow-sm p-4 space-y-3 relative"
            >
              {isActionMode && (
                <div className="absolute top-4 right-4 z-10">
                  <Checkbox
                    checked={selectedRows.includes(poin.id)}
                    onCheckedChange={(c) => handleSelectRow(poin.id, !!c)}
                  />
                </div>
              )}
              <div className="flex flex-col pr-8">
                <div className="font-semibold text-foreground mb-1">{poin.name}</div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {poin.phone || "-"}
                  </div>
                  <div className="text-xs">Diperbarui: {poin.lastUpdated}</div>
                </div>
              </div>
              <div className="flex justify-between items-end pt-3 border-t">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Poin</span>
                  <div className="font-bold text-primary text-lg">{(poin.points || 0).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground block mb-2">Status</span>
                  <Switch
                    checked={poin.status === "Aktif"}
                    onCheckedChange={() => toggleStatus(poin.id)}
                    aria-label={`Toggle status ${poin.name}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-none border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">
                {isActionMode ? (
                  <div className="flex justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                ) : (
                  "No"
                )}
              </TableHead>
              <TableHead>Nama Pelanggan</TableHead>
              <TableHead>No. Telp</TableHead>
              <TableHead className="text-center w-[150px]">Jumlah Poin</TableHead>
              <TableHead className="text-center w-[180px]">Terakhir Diperbarui</TableHead>
              <TableHead className="text-center w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: filteredPoin.length > 0 ? Math.min(filteredPoin.length, 10) : 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-none" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredPoin.slice((currentPage - 1) * 10, currentPage * 10).map((poin, index) => (
                <TableRow key={poin.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {isActionMode ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={selectedRows.includes(poin.id)}
                          onCheckedChange={(c) => handleSelectRow(poin.id, !!c)}
                        />
                      </div>
                    ) : (
                      (currentPage - 1) * 10 + index + 1
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {poin.name}
                  </TableCell>
                  <TableCell>
                    {poin.phone}
                  </TableCell>
                  <TableCell className="text-center font-bold text-primary">
                    {(poin.points || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {poin.lastUpdated}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={poin.status === "Aktif"}
                        onCheckedChange={() => toggleStatus(poin.id)}
                        aria-label={`Toggle status ${poin.name}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && filteredPoin.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Tidak ada data poin yang cocok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="rounded-none border bg-card overflow-hidden shadow-sm mt-4 md:mt-0 md:border-t-0">
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPoin.length / 10)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
