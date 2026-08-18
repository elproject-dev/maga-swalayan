"use client"

import { useState, useEffect } from "react"
import ExcelJS from "exceljs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/toast"

import { TablePagination } from "@/components/table-pagination"
import { supabase } from "@/lib/supabase"


export default function DatabasePage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [isActionMode, setIsActionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCustomers = async () => {
    setIsLoading(true)
    const { data: pelangganData } = await supabase
      .from('pelanggan')
      .select('*')
      .order('id', { ascending: true })

    if (pelangganData) {
      // Fetch poin_transactions to calculate actual points
      const { data: poinData } = await supabase
        .from('poin_transactions')
        .select('notelp, poin, tipe')

      const pointsByPhone: Record<string, number> = {};
      if (poinData) {
        poinData.forEach(trx => {
          if (!trx.notelp) return;
          if (!pointsByPhone[trx.notelp]) pointsByPhone[trx.notelp] = 0;
          const p = Number(trx.poin) || 0;
          if (trx.tipe === 'plus') {
            pointsByPhone[trx.notelp] += p;
          } else {
            pointsByPhone[trx.notelp] -= p;
          }
        });
      }

      const calculatedCustomers = pelangganData
        .filter(customer => customer.membercard && customer.membercard.trim() !== '' && customer.membercard !== '-')
        .map(customer => ({
          ...customer,
          points: pointsByPhone[customer.phone] || 0
        }));

      setCustomers(calculatedCustomers)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      (customer.name || "").toLowerCase().includes(query) ||
      (customer.membercard || "").toLowerCase().includes(query) ||
      (customer.phone || "").toLowerCase().includes(query) ||
      (customer.email || "").toLowerCase().includes(query)
    )
  })

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

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
      toast.add({ title: `${count} data berhasil dihapus`, type: "success" })
      setIsActionMode(false)
    } else {
      toast.add({ title: "Gagal menghapus", description: error.message, type: "error" })
    }
    setIsDeleting(false)
  }

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Database Member");

    worksheet.columns = [
      { header: 'ID Member', key: 'idmember', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Nama Pelanggan', key: 'nama', width: 25, style: { alignment: { horizontal: 'left' } } }, // B
      { header: 'Email', key: 'email', width: 25, style: { alignment: { horizontal: 'left' } } },
      { header: 'No. Telp', key: 'notelp', width: 18, style: { alignment: { horizontal: 'left' } } }, // D
      { header: 'Alamat', key: 'alamat', width: 30, style: { alignment: { horizontal: 'left' } } },
      { header: 'Provinsi', key: 'provinsi', width: 25, style: { alignment: { horizontal: 'left' } } }, // E
      { header: 'Kecamatan', key: 'kecamatan', width: 20, style: { alignment: { horizontal: 'center' } } }, // F
      { header: 'Kabupaten', key: 'kabupaten', width: 20, style: { alignment: { horizontal: 'center' } } }, // G
      { header: 'Kelahiran', key: 'kelahiran', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'Poin', key: 'poin', width: 10, style: { alignment: { horizontal: 'center' } } },
    ];

    filteredCustomers.forEach(c => {
      worksheet.addRow({
        idmember: c.membercard || '-',
        nama: c.name || '-',
        email: c.email || '-',
        notelp: c.phone || '-',
        alamat: c.alamat || '-',
        provinsi: c.provinsi || '-',
        kecamatan: c.kecamatan || '-',
        kabupaten: c.kabupaten || '-',
        kelahiran: c.tanggal_lahir || '-',
        poin: c.points || 0
      });
    });

    // Style Header Row (row 1)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF000000' } // Black
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' }, // White
        bold: true
      };
      cell.alignment = { ...(cell.alignment || {}), vertical: 'middle', horizontal: worksheet.getColumn(cell.col).alignment?.horizontal || 'center' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_member_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.add({ title: "Data berhasil diexport ke Excel", type: "success" })
  }

  const isAllSelected = selectedRows.length === filteredCustomers.length && filteredCustomers.length > 0

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Database Member</h1>
          <p className="text-muted-foreground text-sm mt-1">Data pelanggan yang terdaftar sebagai member.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, email, telepon, atau ID..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-2 items-center">
          <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none">
            Export
          </Button>
          {isActionMode ? (
            <>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={selectedRows.length === 0 || isDeleting}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-2"
              >
                {isDeleting ? "Hapus..." : `Hapus (${selectedRows.length})`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsActionMode(false)
                  setSelectedRows([])
                }}
                disabled={isDeleting}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-2"
              >
                Batal
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsActionMode(true)} className="flex-1 sm:flex-none">
              Aksi
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="flex flex-col gap-3 md:hidden mt-4">
        {isLoading ? null : filteredCustomers.length === 0 ? (
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

              <div className={isActionMode ? "pr-8" : ""}>
                <p className="font-semibold text-lg">{customer.name || "-"}</p>
                {customer.membercard ? (
                  <p className="text-sm font-bold text-orange-500">{customer.membercard}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">No. Telp</span>
                  <span className="font-medium">{customer.phone || "-"}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-xs">Poin</span>
                  <span className={`font-medium ${customer.points && customer.points > 0 ? 'text-green-600 font-bold' : ''}`}>
                    {customer.points?.toLocaleString('id-ID') || "0"}
                  </span>
                </div>
              </div>



              <div className="text-sm">
                <span className="text-muted-foreground block text-xs">Provinsi</span>
                <span className="truncate block max-w-full">{customer.provinsi || "-"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-none border bg-card overflow-hidden shadow-sm overflow-x-auto mt-4">
        <Table className="whitespace-nowrap min-w-max">
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
              <TableHead>ID Member</TableHead>
              <TableHead>Nama Pelanggan</TableHead>

              <TableHead className="hidden sm:table-cell">No. Telp</TableHead>
              <TableHead className="hidden lg:table-cell">Provinsi</TableHead>
              <TableHead className="hidden md:table-cell">Kecamatan</TableHead>
              <TableHead className="hidden md:table-cell">Kabupaten</TableHead>
              <TableHead className="hidden xl:table-cell text-center">Kelahiran</TableHead>
              <TableHead className="text-center">Poin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? null : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Tidak ada data pelanggan yang cocok.
                </TableCell>
              </TableRow>
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
                  <TableCell>
                    {customer.membercard ? (
                      <span className="font-bold text-orange-500">{customer.membercard}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.name || "-"}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {customer.phone || "-"}
                  </TableCell>
                  <TableCell className="truncate max-w-[120px] hidden lg:table-cell" title={customer.provinsi}>
                    {customer.provinsi || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.kecamatan || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.kabupaten || "-"}
                  </TableCell>
                  <TableCell className="text-center hidden xl:table-cell">
                    {customer.tanggal_lahir ? new Date(customer.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                  </TableCell>
                  <TableCell className={`text-center font-medium ${customer.points && customer.points > 0 ? 'text-green-600 font-bold' : ''}`}>
                    {customer.points?.toLocaleString('id-ID') || "0"}
                  </TableCell>
                </TableRow>
              ))
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
