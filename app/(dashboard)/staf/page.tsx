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
import { Trash2, Search, Users, UserCheck, Loader2 } from "lucide-react"

import { TablePagination } from "@/components/table-pagination"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"

const initialStaff = [
  { id: 1, name: "Ahmad Fauzi", role: "Manajer", email: "ahmad.fauzi@example.com", phone: "081234567001", isActive: true },
  { id: 2, name: "Siti Rahma", role: "Kasir", email: "siti.rahma@example.com", phone: "081298767002", isActive: true },
  { id: 3, name: "Dedi Kurniawan", role: "Gudang", email: "dedi.k@example.com", phone: "081345677003", isActive: true },
  { id: 4, name: "Fitriani", role: "Kasir", email: "fitriani@example.com", phone: "085612347004", isActive: false },
  { id: 5, name: "Bambang Sugeng", role: "Security", email: "bambang.s@example.com", phone: "089698767005", isActive: true },
]

export default function StafPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [staffList, setStaffList] = useState<any[]>(initialStaff)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isActionMode, setIsActionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStaff = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('staf')
      .select('*')
      .order('id', { ascending: true })
    if (data) {
      setStaffList(data.map(item => ({
        id: item.id,
        name: item.name,
        role: item.role,
        email: item.email,
        phone: item.phone,
        isActive: item.is_active
      })))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsMounted(true)
    fetchStaff()
  }, [])

  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.phone.includes(q)
    )
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredStaff.map((s) => s.id))
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
      .from('staf')
      .delete()
      .in('id', selectedRows)
    if (!error) {
      setStaffList(prev => prev.filter(s => !selectedRows.includes(s.id)))
      setSelectedRows([])
      toast.add({ title: `${count} staf berhasil dihapus`, type: "success" })
    } else {
      toast.add({ title: "Gagal menghapus staf", description: error.message, type: "error" })
    }
    setIsDeleting(false)
  }

  const isAllSelected = selectedRows.length === filteredStaff.length && filteredStaff.length > 0

  const toggleStatus = async (id: number) => {
    const staf = staffList.find(s => s.id === id)
    if (!staf) return
    const newStatus = !staf.isActive
    const { error } = await supabase
      .from('staf')
      .update({ is_active: newStatus })
      .eq('id', id)
    if (!error) {
      setStaffList(staffList.map(s =>
        s.id === id ? { ...s, isActive: newStatus } : s
      ))
      toast.add({ title: `Status ${staf.name} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`, type: "success" })
    } else {
      toast.add({ title: "Gagal memperbarui status", description: error.message, type: "error" })
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-8 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Daftar Staf</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau no. telp..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            <div key={i} className="bg-card rounded-xl border p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-between pt-3 border-t">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          ))
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border">
            Tidak ada data staf yang cocok.
          </div>
        ) : (
          filteredStaff.slice((currentPage - 1) * 10, currentPage * 10).map((staf) => (
            <div 
              key={staf.id} 
              className="bg-card rounded-xl border shadow-sm p-4 space-y-3 relative"
            >
              {isActionMode && (
                <div className="absolute top-4 right-4 z-10">
                  <Checkbox
                    checked={selectedRows.includes(staf.id)}
                    onCheckedChange={(c) => handleSelectRow(staf.id, !!c)}
                  />
                </div>
              )}
              <div className="flex flex-col pr-8">
                <div className="font-semibold text-foreground mb-1">{staf.name}</div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="font-medium text-primary">{staf.role}</div>
                  <div>{staf.phone || "-"}</div>
                  <div>{staf.email || "-"}</div>
                </div>
              </div>
              <div className="flex justify-between items-end pt-3 border-t">
                <div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground block mb-2">Status</span>
                  <Switch
                    checked={staf.isActive}
                    onCheckedChange={() => toggleStatus(staf.id)}
                    aria-label={`Toggle status ${staf.name}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50px] text-center border-r">
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
              <TableHead className="border-r">Nama Staf</TableHead>
              <TableHead className="border-r">Jabatan</TableHead>
              <TableHead className="border-r">Email</TableHead>
              <TableHead className="border-r">No. Telp</TableHead>
              <TableHead className="text-center w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: filteredStaff.length > 0 ? Math.min(filteredStaff.length, 10) : 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="border-r"><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                  <TableCell className="border-r"><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell className="border-r"><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="border-r"><Skeleton className="h-6 w-40" /></TableCell>
                  <TableCell className="border-r"><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 mx-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredStaff.slice((currentPage - 1) * 10, currentPage * 10).map((staf, index) => (
                <TableRow key={staf.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="text-center border-r font-medium text-muted-foreground">
                    {isActionMode ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={selectedRows.includes(staf.id)}
                          onCheckedChange={(c) => handleSelectRow(staf.id, !!c)}
                        />
                      </div>
                    ) : (
                      (currentPage - 1) * 10 + index + 1
                    )}
                  </TableCell>
                  <TableCell className="font-semibold border-r">
                    {staf.name}
                  </TableCell>
                  <TableCell className="border-r font-medium text-muted-foreground">
                    {staf.role}
                  </TableCell>
                  <TableCell className="border-r text-sm">
                    {staf.email}
                  </TableCell>
                  <TableCell className="border-r text-sm">
                    {staf.phone}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={staf.isActive}
                        onCheckedChange={() => toggleStatus(staf.id)}
                        aria-label={`Toggle status ${staf.name}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && filteredStaff.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Tidak ada data staf yang cocok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm mt-4 md:mt-0 md:border-t-0 md:rounded-t-none">
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredStaff.length / 10)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
