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
import { Trash2, Search, Loader2 } from "lucide-react"

import { TablePagination } from "@/components/table-pagination"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"

const initialCustomers = [
  { id: 1, name: "Budi Santoso", email: "budi.santoso@example.com", phone: "081234567890", points: 1500, isActive: true },
  { id: 2, name: "Siti Aminah", email: "siti.aminah@example.com", phone: "081298765432", points: 450, isActive: true },
  { id: 3, name: "Andi Wijaya", email: "andi.wijaya@example.com", phone: "081345678912", points: 0, isActive: false },
  { id: 4, name: "Dewi Lestari", email: "dewi.lestari@example.com", phone: "085612345678", points: 3200, isActive: true },
  { id: 5, name: "Rudi Hermawan", email: "rudi.h@example.com", phone: "089698761234", points: 120, isActive: false },
  { id: 6, name: "Indah Permatasari", email: "indah.p@example.com", phone: "087711223344", points: 890, isActive: true },
  { id: 7, name: "Toko Makmur (Grosir)", email: "tokomakmur@example.com", phone: "082255667788", points: 12500, isActive: true },
]

export default function PelangganPage() {
  const [customers, setCustomers] = useState<any[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isActionMode, setIsActionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCustomers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('pelanggan')
      .select('*')
      .order('id', { ascending: true })
    if (data) {
      setCustomers(data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        points: item.points,
        isActive: item.is_active
      })))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    )
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredCustomers.map((c) => c.id))
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
    if (selectedRows.length === 0) return
    setIsDeleting(true)
    const count = selectedRows.length
    const { error } = await supabase
      .from('pelanggan')
      .delete()
      .in('id', selectedRows)
    if (!error) {
      setCustomers(prev => prev.filter(c => !selectedRows.includes(c.id)))
      setSelectedRows([])
      toast.add({ title: `${count} pelanggan berhasil dihapus`, type: "success" })
    } else {
      toast.add({ title: "Gagal menghapus pelanggan", description: error.message, type: "error" })
    }
    setIsDeleting(false)
  }

  const isAllSelected = selectedRows.length === filteredCustomers.length && filteredCustomers.length > 0
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < filteredCustomers.length

  const toggleStatus = async (id: number) => {
    const customer = customers.find(c => c.id === id)
    if (!customer) return
    const newStatus = !customer.isActive
    const { error } = await supabase
      .from('pelanggan')
      .update({ is_active: newStatus })
      .eq('id', id)
    if (!error) {
      setCustomers(customers.map(c =>
        c.id === id ? { ...c, isActive: newStatus } : c
      ))
      toast.add({ title: `Status ${customer.name} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
    } else {
      toast.add({ title: "Gagal memperbarui status", description: error.message, type: "error" })
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Daftar Pelanggan</h1>
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
        <div className="flex gap-2 items-center self-end sm:self-auto">
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  Menghapus...
                </>
              ) : (
                <>

                  Hapus Terpilih ({selectedRows.length})
                </>
              )}
            </Button>
          )}
          {isActionMode ? (
            <Button
              variant="outline"
              onClick={() => {
                setIsActionMode(false)
                setSelectedRows([])
              }}
              disabled={isDeleting}
            >
              Selesai
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsActionMode(true)}>
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
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card border">
            Tidak ada data pelanggan yang cocok.
          </div>
        ) : (
          filteredCustomers.slice((currentPage - 1) * 10, currentPage * 10).map((customer) => (
            <div 
              key={customer.id} 
              className="bg-card border shadow-sm p-4 space-y-3 relative"
            >
              {isActionMode && (
                <div className="absolute top-4 right-4 z-10">
                  <Checkbox
                    checked={selectedRows.includes(customer.id)}
                    onCheckedChange={(c) => handleSelectRow(customer.id, !!c)}
                  />
                </div>
              )}
              <div className="flex flex-col pr-8">
                <div className="font-semibold text-foreground mb-1">{customer.name}</div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div>{customer.phone || "-"}</div>
                  <div>{customer.email || "-"}</div>
                </div>
              </div>
              <div className="flex justify-between items-end pt-3 border-t">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Poin</span>
                  <div className="font-bold text-primary text-lg">{(customer.points || 0).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground block mb-2">Status</span>
                  <Switch
                    checked={customer.isActive}
                    onCheckedChange={() => toggleStatus(customer.id)}
                    aria-label={`Toggle status ${customer.name}`}
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
              <TableHead>Email</TableHead>
              <TableHead>No. Telp</TableHead>
              <TableHead className="text-center w-[120px]">Poin</TableHead>
              <TableHead className="text-center w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: filteredCustomers.length > 0 ? Math.min(filteredCustomers.length, 10) : 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-none" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredCustomers.slice((currentPage - 1) * 10, currentPage * 10).map((customer, index) => (
                <TableRow key={customer.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {isActionMode ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={selectedRows.includes(customer.id)}
                          onCheckedChange={(c) => handleSelectRow(customer.id, !!c)}
                        />
                      </div>
                    ) : (
                      (currentPage - 1) * 10 + index + 1
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {customer.name}
                  </TableCell>
                  <TableCell>
                    {customer.email}
                  </TableCell>
                  <TableCell>
                    {customer.phone}
                  </TableCell>
                  <TableCell className="text-center font-medium text-primary">
                    {(customer.points || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={customer.isActive}
                        onCheckedChange={() => toggleStatus(customer.id)}
                        aria-label={`Toggle status ${customer.name}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Tidak ada data pelanggan yang cocok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="rounded-none border bg-card overflow-hidden shadow-sm mt-4 md:mt-0 md:border-t-0">
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredCustomers.length / 10)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
