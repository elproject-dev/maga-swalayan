"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { supabase } from "@/lib/supabase"
import { Loader2, Calendar } from "lucide-react"

interface DailyStat {
  no: number
  date: string
  totalTransaksi: number
  totalBayar: number
  totalPoin: number
}

export function TransactionMonthlyAnalysis() {
  // Hitung rentang awal bulan ini (misal 2026-10-01 s/d 2026-10-31)
  const defaultDates = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()

    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)

    const formatISO = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    return {
      start: formatISO(firstDay),
      end: formatISO(lastDay),
    }
  }, [])

  const [startDate, setStartDate] = useState(defaultDates.start)
  const [endDate, setEndDate] = useState(defaultDates.end)
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isEndOpen, setIsEndOpen] = useState(false)

  const [dataList, setDataList] = useState<DailyStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(
    async (start: string, end: string) => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("poin_transactions")
          .select("tanggal, totalbayar, poin, tipe")
          .gte("tanggal", start)
          .lte("tanggal", end)

        if (error) {
          console.error("Error fetching transactions for analytics:", error)
          setDataList([])
          return
        }

        // Kelompokkan data per tanggal
        const mapByDate: Record<string, { count: number; totalBayar: number; totalPoin: number }> = {}

        data?.forEach((trx) => {
          const tgl = trx.tanggal
          if (!tgl) return

          if (!mapByDate[tgl]) {
            mapByDate[tgl] = { count: 0, totalBayar: 0, totalPoin: 0 }
          }
          mapByDate[tgl].count += 1
          mapByDate[tgl].totalBayar += Number(trx.totalbayar) || 0

          const p = Number(trx.poin) || 0
          const isPlus = (trx.tipe || "plus").toLowerCase() === "plus"
          mapByDate[tgl].totalPoin += isPlus ? p : -p
        })

        // Buat daftar tanggal berurutan dari start s/d end
        const s = new Date(start)
        const e = new Date(end)
        const rows: DailyStat[] = []
        let idx = 1

        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, "0")
          const day = String(d.getDate()).padStart(2, "0")
          const dStr = `${year}-${month}-${day}`

          const item = mapByDate[dStr]
          rows.push({
            no: idx++,
            date: dStr,
            totalTransaksi: item ? item.count : 0,
            totalBayar: item ? item.totalBayar : 0,
            totalPoin: item ? item.totalPoin : 0,
          })
        }

        setDataList(rows)
      } catch (err) {
        console.error("Failed to load daily transactions:", err)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchData(startDate, endDate)
  }, [fetchData])

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return
    fetchData(startDate, endDate)
  }

  const setPresetMonth = (offsetMonth: number) => {
    const now = new Date()
    const y = now.getFullYear()
    const targetMonth = now.getMonth() + offsetMonth

    const firstDay = new Date(y, targetMonth, 1)
    const lastDay = new Date(y, targetMonth + 1, 0)

    const formatISO = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const s = formatISO(firstDay)
    const e = formatISO(lastDay)
    setStartDate(s)
    setEndDate(e)
    fetchData(s, e)
  }

  // Hitung total akumulasi
  const totals = useMemo(() => {
    return dataList.reduce(
      (acc, curr) => {
        acc.totalTransaksi += curr.totalTransaksi
        acc.totalBayar += curr.totalBayar
        acc.totalPoin += curr.totalPoin
        return acc
      },
      { totalTransaksi: 0, totalBayar: 0, totalPoin: 0 }
    )
  }, [dataList])

  const formatToDDMMYYYY = (dStr: string) => {
    if (!dStr) return ""
    const parts = dStr.split("-")
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dStr
  }

  // Custom tooltip chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const curData = dataList.find((d) => d.date === label)
      return (
        <div className="rounded-none border border-border bg-popover p-3 shadow-md text-xs">
          <div className="font-bold text-foreground mb-1">{formatToDDMMYYYY(label)}</div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Total Poin:</span>
            <span className="font-bold">{payload.find((p: any) => p.dataKey === "totalPoin")?.value ?? 0}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium mt-0.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Total Transaksi:</span>
            <span className="font-bold">{payload.find((p: any) => p.dataKey === "totalTransaksi")?.value ?? 0}</span>
          </div>
          {curData && (
            <div className="mt-1 pt-1 border-t border-border/60 text-muted-foreground">
              Total Bayar: <span className="font-bold text-foreground">Rp {curData.totalBayar.toLocaleString("id-ID")}</span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="rounded-none border bg-card text-card-foreground shadow-sm">
      <CardHeader className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
          Data Grafik Bulan Ini
        </CardTitle>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-[11px] rounded-none px-2.5"
            onClick={() => setPresetMonth(0)}
          >
            Bulan Ini
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-[11px] rounded-none px-2.5"
            onClick={() => setPresetMonth(-1)}
          >
            Bulan Lalu
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Form Filter Rentang Tanggal dengan Sekali Klik Kalender */}
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4">
          {/* Tanggal Transaksi Awal */}
          <div className="w-full sm:w-auto flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Tanggal Transaksi Awal
            </Label>
            <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-9 justify-start text-left font-mono text-xs rounded-none bg-background hover:bg-muted/30 border-border px-3"
                  >
                    <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{startDate ? formatToDDMMYYYY(startDate) : "Pilih Tanggal Awal"}</span>
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0 rounded-none border shadow-md bg-popover" align="start">
                <CalendarPicker
                  mode="single"
                  selected={startDate ? new Date(startDate + "T00:00:00") : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const y = date.getFullYear()
                      const m = String(date.getMonth() + 1).padStart(2, "0")
                      const d = String(date.getDate()).padStart(2, "0")
                      setStartDate(`${y}-${m}-${d}`)
                      setIsStartOpen(false)
                    }
                  }}
                  defaultMonth={startDate ? new Date(startDate + "T00:00:00") : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tanggal Transaksi Akhir */}
          <div className="w-full sm:w-auto flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Tanggal Transaksi Akhir
            </Label>
            <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-9 justify-start text-left font-mono text-xs rounded-none bg-background hover:bg-muted/30 border-border px-3"
                  >
                    <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{endDate ? formatToDDMMYYYY(endDate) : "Pilih Tanggal Akhir"}</span>
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0 rounded-none border shadow-md bg-popover" align="start">
                <CalendarPicker
                  mode="single"
                  selected={endDate ? new Date(endDate + "T00:00:00") : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const y = date.getFullYear()
                      const m = String(date.getMonth() + 1).padStart(2, "0")
                      const d = String(date.getDate()).padStart(2, "0")
                      setEndDate(`${y}-${m}-${d}`)
                      setIsEndOpen(false)
                    }
                  }}
                  defaultMonth={endDate ? new Date(endDate + "T00:00:00") : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-28 h-9 text-xs font-semibold rounded-none bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Pilih
          </Button>
        </form>

        {/* Grafik Line Chart */}
        <div className="w-full border border-border/80 bg-background/50 p-2 sm:p-4 rounded-none">
          <div className="h-[280px] sm:h-[350px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat grafik analisa...</span>
              </div>
            ) : dataList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Tidak ada data transaksi pada rentang tanggal yang dipilih.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataList} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/30" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: "currentColor", className: "text-muted" }}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickFormatter={(val) => formatToDDMMYYYY(val)}
                    className="text-muted-foreground"
                    interval="preserveStartEnd"
                    minTickGap={25}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "currentColor", className: "text-muted" }}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    className="text-muted-foreground"
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalPoin"
                    name="Poin"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#0284c7", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalTransaksi"
                    name="Transaksi"
                    stroke="#94a3b8"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#94a3b8", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tabel Analisa Harian */}
        <div className="space-y-2">
          <div className="border border-border rounded-none overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12 text-center font-bold border-r text-foreground">#</TableHead>
                  <TableHead className="text-center font-bold border-r text-foreground">Tgl Transaksi</TableHead>
                  <TableHead className="text-center font-bold border-r text-foreground">Total Transaksi</TableHead>
                  <TableHead className="text-center font-bold border-r text-foreground">Total Bayar</TableHead>
                  <TableHead className="text-center font-bold text-foreground">Total Poin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memuat data tabel...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : dataList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                      Tidak ada transaksi pada periode ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  dataList.map((row) => (
                    <TableRow key={row.date} className="hover:bg-muted/20">
                      <TableCell className="text-center font-medium border-r py-2.5 text-muted-foreground">
                        {row.no}
                      </TableCell>
                      <TableCell className="text-center font-mono border-r py-2.5">
                        {formatToDDMMYYYY(row.date)}
                      </TableCell>
                      <TableCell className="text-center font-mono border-r py-2.5">
                        {row.totalTransaksi}
                      </TableCell>
                      <TableCell className="text-right sm:text-center font-mono border-r py-2.5 pr-4 sm:pr-0">
                        {row.totalBayar.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center font-mono py-2.5 font-semibold text-sky-600 dark:text-sky-400">
                        {row.totalPoin}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {dataList.length > 0 && !isLoading && (
                <TableFooter className="bg-muted/40 font-bold">
                  <TableRow className="hover:bg-muted/40">
                    <TableCell colSpan={2} className="text-center border-r font-bold py-3 text-xs">
                      Total Keseluruhan
                    </TableCell>
                    <TableCell className="text-center font-mono border-r py-3 font-bold text-xs">
                      {totals.totalTransaksi.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right sm:text-center font-mono border-r py-3 font-bold text-xs pr-4 sm:pr-0">
                      {totals.totalBayar.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center font-mono py-3 font-bold text-xs text-sky-600 dark:text-sky-400">
                      {totals.totalPoin.toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
