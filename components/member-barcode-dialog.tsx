"use client"

import React, { useEffect, useRef, useState } from "react"
import JsBarcode from "jsbarcode"
import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Barcode, Copy, Check, ScanLine } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

interface MemberBarcodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  membercard: string
  memberName: string
}

export function MemberBarcodeDialog({
  open,
  onOpenChange,
  membercard,
  memberName,
}: MemberBarcodeDialogProps) {
  const [tab, setTab] = useState<"all" | "barcode" | "qr">("all")
  const [copied, setCopied] = useState(false)
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null)
  const barcodeOnlySvgRef = useRef<SVGSVGElement | null>(null)

  const cleanId = membercard && membercard !== "-" ? membercard : "MG-SW000001"

  useEffect(() => {
    if (!open) return

    // Render Barcode Code 128
    const renderBarcode = (elem: SVGSVGElement | null) => {
      if (elem && cleanId) {
        try {
          JsBarcode(elem, cleanId, {
            format: "CODE128",
            lineColor: "#000000",
            width: 2.2,
            height: 65,
            displayValue: true,
            font: "monospace",
            fontSize: 15,
            textMargin: 6,
            background: "#ffffff",
          })
        } catch (err) {
          console.error("Failed to render barcode:", err)
        }
      }
    }

    // Delay slightly to ensure dialog DOM is mounted
    const timeout = setTimeout(() => {
      renderBarcode(barcodeSvgRef.current)
      renderBarcode(barcodeOnlySvgRef.current)
    }, 50)

    return () => clearTimeout(timeout)
  }, [open, cleanId, tab])

  const handleCopyId = () => {
    if (!cleanId) return
    navigator.clipboard.writeText(cleanId)
    setCopied(true)
    toast.success("ID Member Tersalin", {
      description: `${cleanId} berhasil disalin ke clipboard.`
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-5 rounded-sm border-primary/20 bg-background">
        <DialogHeader className="text-center sm:text-center pb-2">
          <div className="mx-auto w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-2">
            <ScanLine className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Barcode & QR Member Kasir
          </DialogTitle>
          <DialogDescription className="sr-only">
            Barcode & QR Code Member Kasir
          </DialogDescription>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex bg-muted p-1 rounded-sm gap-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              tab === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ScanLine className="h-3.5 w-3.5" />
            <span>Semua</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("barcode")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              tab === "barcode" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Barcode className="h-3.5 w-3.5" />
            <span>Barcode 1D</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("qr")}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              tab === "qr" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Scan Display Box - Pure White High-Contrast for Cashier Scanners */}
        <div className="bg-white rounded-sm border-2 border-zinc-200 p-4 shadow-sm flex flex-col items-center justify-center gap-4 text-black">
          {/* Member Identity Header inside Scan Box */}
          <div className="w-full flex items-center justify-between border-b border-zinc-100 pb-2 text-xs">
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Nama Member</span>
              <span className="font-bold text-zinc-800 text-sm truncate max-w-[200px]">{memberName || "Member Maga"}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
              title="Salin ID Member"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-zinc-500" />}
              <span>{cleanId}</span>
            </button>
          </div>

          {/* Tab: All (Barcode on top, QR below) */}
          {tab === "all" && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* 1D Barcode */}
              <div className="w-full flex flex-col items-center justify-center overflow-x-auto py-1">
                <svg ref={barcodeSvgRef} className="max-w-full" />
              </div>

              {/* 2D QR Code */}
              <div className="p-2 border border-zinc-200 rounded-sm bg-white shadow-xs">
                <QRCodeSVG
                  value={cleanId}
                  size={140}
                  level="H"
                  includeMargin={true}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
            </div>
          )}

          {/* Tab: Barcode Only */}
          {tab === "barcode" && (
            <div className="w-full flex flex-col items-center justify-center py-4">
              <svg ref={barcodeOnlySvgRef} className="max-w-full" />
              <p className="text-[11px] text-zinc-500 mt-2 font-medium">Cocok untuk scanner kasir laser / CCD standard.</p>
            </div>
          )}

          {/* Tab: QR Only */}
          {tab === "qr" && (
            <div className="flex flex-col items-center justify-center py-3">
              <div className="p-3 border border-zinc-200 rounded-sm bg-white shadow-xs">
                <QRCodeSVG
                  value={cleanId}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-3 font-medium">Cocok untuk scanner kasir 2D maupun kamera HP.</p>
            </div>
          )}

        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-sm text-xs h-8 px-4"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
