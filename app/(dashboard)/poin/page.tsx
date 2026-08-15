"use client"

import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import ExcelJS from "exceljs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search, FileSpreadsheet, Loader2, Download, Upload, Trash2 } from "lucide-react"

import { TablePagination } from "@/components/table-pagination"
import { supabase } from "@/lib/supabase"

import { toast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

const dummyTransactionsData = [
  { id: "e17a54ad-4375-4fc1-a9f9-eb163ffc5d80", idtransaksi: "FJ45-726-04604", tanggal: "2026-07-23", idcabang: "MG04", membercard: "0525000037", notelp: "081234567890", totalbayar: 76800, poin: 2, description: "", tipe: "plus" },
  { id: "9a2fb821-65b3-463d-b4f0-482a5c483a99", idtransaksi: "FJ45-726-04605", tanggal: "2026-07-24", idcabang: "MG04", membercard: "0525000038", notelp: "081987654321", totalbayar: 150000, poin: 5, description: "", tipe: "plus" },
  { id: "732e92c2-8bbd-463b-9a99-b1d7d54020a1", idtransaksi: "FJ45-726-04606", tanggal: "2026-07-24", idcabang: "MG04", membercard: "0525000037", notelp: "081234567890", totalbayar: 0, poin: 1, description: "Redeem", tipe: "minus" },
]

export default function PoinPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [transactionList, setTransactionList] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isActionMode, setIsActionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importingFileName, setImportingFileName] = useState<string>("")
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importRecords, setImportRecords] = useState<any[]>([])

  const fetchTransactions = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('poin_transactions')
      .select('*')
      .order('tanggal', { ascending: false })

    if (data) {
      setTransactionList(data)
      if (data.length > 0) {
        // Ambil waktu data ter-create paling baru di database
        const latestTime = data.reduce((latest, current) => {
          const currentT = new Date(current.created_at || 0).getTime();
          return currentT > latest ? currentT : latest;
        }, 0);
        setLastUpdate(latestTime > 0 ? new Date(latestTime) : null)
      } else {
        setLastUpdate(null)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsMounted(true)
    fetchTransactions()
  }, [])

  const filteredTransactions = transactionList.filter((t) => {
    const q = searchQuery.toLowerCase()
    return t.membercard?.toLowerCase().includes(q) || t.idtransaksi?.toLowerCase().includes(q) || t.notelp?.includes(q)
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredTransactions.map((c) => c.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id])
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('poin_transactions')
      .delete()
      .in('id', selectedRows)
    if (!error) {
      setTransactionList(transactionList.filter(c => !selectedRows.includes(c.id)))
      setSelectedRows([])
      setIsActionMode(false)
      toast.add({ title: "Berhasil dihapus", type: "success" })
    } else {
      toast.add({ title: "Gagal menghapus", description: error.message, type: "error" })
    }
  }

  const isAllSelected = selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const formatToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) { // yyyy-mm-dd
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  const handleExport = async () => {
    if (transactionList.length === 0) return

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Riwayat Transaksi");

    worksheet.columns = [
      { header: 'IDTRANSAKSI', key: 'idtransaksi', width: 20, style: { alignment: { horizontal: 'left' } } },
      { header: 'TANGGAL', key: 'tanggal', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'IDCABANG', key: 'idcabang', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'MEMBERCARD', key: 'membercard', width: 20, style: { alignment: { horizontal: 'center' } } },
      { header: 'NO TELP', key: 'notelp', width: 20, style: { alignment: { horizontal: 'center' } } },
      { header: 'TOTALBAYAR', key: 'totalbayar', width: 18, style: { alignment: { horizontal: 'right' } } },
      { header: 'POIN', key: 'poin', width: 10, style: { alignment: { horizontal: 'center' } } },
      { header: 'DESCRIPTION', key: 'description', width: 25, style: { alignment: { horizontal: 'left' } } },
      { header: 'TIPE', key: 'tipe', width: 12, style: { alignment: { horizontal: 'center' } } },
    ];

    // Add rows
    transactionList.forEach((t) => {
      worksheet.addRow({
        idtransaksi: t.idtransaksi,
        tanggal: formatToDDMMYYYY(t.tanggal),
        idcabang: t.idcabang,
        membercard: t.membercard,
        notelp: t.notelp,
        totalbayar: t.totalbayar,
        poin: t.poin,
        description: t.description,
        tipe: t.tipe
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
      cell.alignment = { ...(cell.alignment || {}), vertical: 'middle' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Transaksi_Poin_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const handleDownloadSample = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template TRANJUAL");

    worksheet.columns = [
      { header: 'IDTRANSAKSI', key: 'idtransaksi', width: 20, style: { alignment: { horizontal: 'left' } } },
      { header: 'TANGGAL', key: 'tanggal', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'IDCABANG', key: 'idcabang', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'MEMBERCARD', key: 'membercard', width: 20, style: { alignment: { horizontal: 'center' } } },
      { header: 'NO TELP', key: 'notelp', width: 20, style: { alignment: { horizontal: 'center' } } },
      { header: 'TOTALBAYAR', key: 'totalbayar', width: 18, style: { alignment: { horizontal: 'right' } } },
      { header: 'POIN', key: 'poin', width: 10, style: { alignment: { horizontal: 'center' } } },
      { header: 'DESCRIPTION', key: 'description', width: 25, style: { alignment: { horizontal: 'left' } } },
      { header: 'TIPE', key: 'tipe', width: 12, style: { alignment: { horizontal: 'center' } } },
    ];

    worksheet.addRow({
      idtransaksi: 'FJ45-726-04604',
      tanggal: '2026-07-23',
      idcabang: 'MG04',
      membercard: '0525000037',
      notelp: '081234567890',
      totalbayar: 76800,
      poin: 2,
      description: '',
      tipe: 'plus'
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
      cell.alignment = { ...(cell.alignment || {}), vertical: 'middle' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sample_TRANJUAL.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImportRecords([])
      setImportPreview([])
      setImportingFileName("")
      return
    }

    setImportingFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        const json = XLSX.utils.sheet_to_json<any>(worksheet)
        const records = []

        for (const row of json) {
          const idtransaksi = row['IDTRANSAKSI'] || row['idtransaksi']
          if (!idtransaksi) continue;

          let parsedDate = new Date().toISOString().split('T')[0];
          const dateVal = row['TANGGAL'];
          if (dateVal) {
            if (dateVal instanceof Date) {
              parsedDate = new Date(dateVal.getTime() - dateVal.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            } else if (!isNaN(Number(dateVal))) {
              const dateObj = new Date(Math.round((Number(dateVal) - 25569) * 86400 * 1000));
              parsedDate = dateObj.toISOString().split('T')[0];
            } else {
              let dateStr = String(dateVal).trim();
              if (dateStr.includes('-') || dateStr.includes('/')) {
                const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
                if (parts.length === 3 && parts[0].length <= 2) {
                  parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                } else if (parts.length === 3 && parts[0].length === 4) {
                  parsedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                }
              }
            }
          }

          const keys = Object.keys(row);
          let noTelp = row['NO TELP'] || row['NOTELP'] || row['No Telp'];
          if (!noTelp && keys.length >= 9) {
            noTelp = row[keys[8]];
          }

          records.push({
            idtransaksi: String(idtransaksi).trim(),
            tanggal: parsedDate,
            idcabang: String(row['IDCABANG'] || '').trim(),
            membercard: String(row['MEMBERCARD'] || '').trim(),
            notelp: noTelp ? String(noTelp).trim() : '',
            totalbayar: Number(row['TOTALBAYAR']) || 0,
            poin: Number(row['POIN']) || 0,
            description: String(row['DESCRIPTION'] || '').trim(),
            tipe: String(row['TIPE'] || 'plus').trim()
          })
        }

        setImportRecords(records)
        setImportPreview(records.slice(0, 3))
      } catch (error) {
        toast.add({ title: "Gagal membaca file Excel", type: "error" })
      }
    }
    reader.onerror = () => {
      toast.add({ title: "Gagal membaca file", type: "error" })
    }
    reader.readAsArrayBuffer(file)
  }

  const handleConfirmImport = async () => {
    if (importRecords.length === 0) {
      toast.add({ title: "Tidak ada transaksi", description: "Anda belum memilih file atau file Excel yang Anda unggah kosong/tidak valid.", type: "error" })
      return
    }

    setIsLoading(true)
    setImportProgress(0)

    try {
      // Chunking agar tidak timeout dan bisa memunculkan progress bar untuk ribuan data
      const CHUNK_SIZE = 500;
      let totalSuccess = 0;
      let hasError = false;
      let lastErrorMessage = "";

      for (let i = 0; i < importRecords.length; i += CHUNK_SIZE) {
        const chunk = importRecords.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase
          .from('poin_transactions')
          .upsert(chunk, { onConflict: 'idtransaksi' })

        if (error) {
          hasError = true;
          lastErrorMessage = error.message;
          break; // Stop jika ada error
        }

        totalSuccess += chunk.length;
        const progress = Math.min(100, Math.round((totalSuccess / importRecords.length) * 100));
        setImportProgress(progress);
      }

      if (hasError) {
        toast.add({ title: "Gagal import", description: lastErrorMessage, type: "error" })
      } else {
        toast.add({ title: "Sukses import", description: `${totalSuccess} transaksi berhasil ditambahkan`, type: "success" })
        setImportRecords([])
        setImportPreview([])
        setIsImportModalOpen(false)
        fetchTransactions()
      }
    } catch (err: any) {
      toast.add({ title: "Kesalahan sistem", description: err.message, type: "error" })
    } finally {
      setIsLoading(false)
      setImportProgress(0)
    }
  }

  if (!isMounted) return null

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-8 px-4 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Riwayat Poin Member</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari ID Transaksi / Membercard..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-start px-3 py-2 border rounded-none bg-card text-xs font-medium text-muted-foreground whitespace-nowrap w-full sm:w-auto h-10 shadow-sm">
            Update: <span className="text-foreground ml-1.5">{lastUpdate ? lastUpdate.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('pukul ', '') : '-'}</span>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            {isActionMode ? (
              <>
                <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="flex-1 sm:flex-none">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={selectedRows.length === 0}
                  className="w-full sm:w-auto"
                >
                  Hapus Terpilih ({selectedRows.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsActionMode(false)
                    setSelectedRows([])
                  }}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsActionMode(true)} className="w-full sm:w-auto">
                Aksi
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading ? null : filteredTransactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card border">
            Tidak ada transaksi.
          </div>
        ) : (
          filteredTransactions.slice((currentPage - 1) * 10, currentPage * 10).map((t) => (
            <div
              key={t.id}
              className="bg-card border shadow-sm p-4 space-y-3 relative"
            >
              {isActionMode && (
                <div className="absolute top-4 right-4 z-10">
                  <Checkbox
                    checked={selectedRows.includes(t.id)}
                    onCheckedChange={(c) => handleSelectRow(t.id, !!c)}
                  />
                </div>
              )}

              <div className={isActionMode ? "pr-8" : ""}>
                <p className="font-medium text-sm">{t.idtransaksi}</p>
                <p className="text-xs text-muted-foreground">{formatToDDMMYYYY(t.tanggal)}</p>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Member:</span>
                <span className="font-semibold text-primary">{t.membercard}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">No. Telp:</span>
                <span className="font-medium">{t.notelp || '-'}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">Rp {t.totalbayar?.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className={`px-2 py-1 text-[10px] font-semibold ${t.tipe === 'plus' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {t.tipe?.toUpperCase()}
                </span>
                <span className={`font-bold text-base ${t.tipe === 'plus' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.tipe === 'plus' ? '+' : '-'}{t.poin} Poin
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-none border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {isActionMode && (
                  <TableHead className="w-[50px] text-center">
                    <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                  </TableHead>
                )}
                <TableHead>ID Transaksi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Membercard</TableHead>
                <TableHead>No. Telp</TableHead>
                <TableHead className="text-right">Total Bayar</TableHead>
                <TableHead className="text-center">Poin</TableHead>
                <TableHead className="text-center">Tipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? null : (
                filteredTransactions.slice((currentPage - 1) * 10, currentPage * 10).map((t) => (
                  <TableRow key={t.id} className="hover:bg-accent/50 transition-colors">
                    {isActionMode && (
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedRows.includes(t.id)}
                          onCheckedChange={(c) => handleSelectRow(t.id, !!c)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{t.idtransaksi}</TableCell>
                    <TableCell>{formatToDDMMYYYY(t.tanggal)}</TableCell>
                    <TableCell className="font-semibold text-primary">{t.membercard}</TableCell>
                    <TableCell>{t.notelp || '-'}</TableCell>
                    <TableCell className="text-right">Rp {t.totalbayar?.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-center font-bold">
                      <span className={t.tipe === 'plus' ? 'text-green-600' : 'text-red-600'}>
                        {t.tipe === 'plus' ? '+' : '-'}{t.poin}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 text-xs font-semibold ${t.tipe === 'plus' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {t.tipe?.toUpperCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isActionMode ? 8 : 7} className="h-24 text-center text-muted-foreground">
                    Tidak ada transaksi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-none border bg-card overflow-hidden shadow-sm md:border-t-0">
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(filteredTransactions.length / 10))}
          onPageChange={setCurrentPage}
        />
      </div>

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Data Poin Pelanggan</DialogTitle>
            <DialogDescription>
              Unggah file Excel - Pastikan sesuai format Sample
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleDownloadSample} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Unduh Sample
              </Button>
              <div className="flex-1 w-full">
                <Input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="cursor-pointer p-0 pr-3 file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 file:border-0 file:rounded-none file:h-full file:px-4 file:mr-4 file:font-medium text-muted-foreground h-10 rounded-none overflow-hidden"
                />
              </div>
            </div>

            {importRecords.length > 0 && !isLoading && (
              <div className="p-4 border rounded-none bg-muted mt-2">
                <div className="text-sm font-medium">{importRecords.length.toLocaleString("id-ID")} data berhasil terdeteksi</div>
              </div>
            )}

            {isLoading && importingFileName && (
              <div className="flex flex-col gap-2 p-4 border rounded-none bg-muted mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium truncate">{importingFileName}</div>
                  <div className="text-xs font-medium">{importProgress}%</div>
                </div>
                <div className="w-full h-2 bg-secondary rounded-none overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsImportModalOpen(false)
              setImportRecords([])
              setImportPreview([])
            }}>
              Batal
            </Button>
            <Button onClick={handleConfirmImport} disabled={isLoading}>
              {isLoading ? "Mengimpor..." : "Konfirmasi Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
