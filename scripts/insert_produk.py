import sys

with open('app/settings/page.tsx', 'r') as f:
    lines = f.readlines()

dummy_pilihan_marker = "const menuItems ="
state_pilihan_marker = "  const isAllPilihanSelected"
ui_placeholder_marker = "{activeMenu === 'produk' && ("

dummy_produk = """const dummyProdukHariIni = [
  { id: 1, title: "Minyak Goreng 2L", price: "Rp 32.500", src: "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?w=600&h=400&fit=crop" },
  { id: 2, title: "Beras Premium 5kg", price: "Rp 69.000", src: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=600&h=400&fit=crop" },
];

"""

state_produk = """  const [produks, setProduks] = useState(dummyProdukHariIni)
  const [selectedProdukRows, setSelectedProdukRows] = useState<number[]>([])
  const [isProdukDialogOpen, setIsProdukDialogOpen] = useState(false)
  const [editingProdukId, setEditingProdukId] = useState<number | null>(null)
  const [isSavingProduk, setIsSavingProduk] = useState(false)
  const [newProduk, setNewProduk] = useState({ title: "", price: "", src: "" })
  const [produkFileName, setProdukFileName] = useState("")

  useEffect(() => {
    const savedProduks = localStorage.getItem('produks')
    if (savedProduks) {
      setProduks(JSON.parse(savedProduks))
    }
  }, [])

  const handleDeleteProduk = () => {
    const updated = produks.filter(p => !selectedProdukRows.includes(p.id))
    setProduks(updated)
    localStorage.setItem('produks', JSON.stringify(updated))
    setSelectedProdukRows([])
  }

  const handleAddClickProduk = () => {
    setEditingProdukId(null)
    setNewProduk({ title: "", price: "", src: "" })
    setProdukFileName("")
    setIsProdukDialogOpen(true)
  }

  const handleEditClickProduk = (produk: any) => {
    setEditingProdukId(produk.id)
    setNewProduk({ title: produk.title, price: produk.price, src: produk.src })
    setProdukFileName("Gambar saat ini")
    setIsProdukDialogOpen(true)
  }

  const handleSaveProduk = () => {
    if (newProduk.title && newProduk.price && newProduk.src) {
      setIsSavingProduk(true)
      setTimeout(() => {
        if (editingProdukId) {
          const updated = produks.map(p => p.id === editingProdukId ? { ...p, ...newProduk } : p)
          setProduks(updated)
          localStorage.setItem('produks', JSON.stringify(updated))
        } else {
          const updated = [{ ...newProduk, id: Date.now() }, ...produks]
          setProduks(updated)
          localStorage.setItem('produks', JSON.stringify(updated))
        }
        setIsSavingProduk(false)
        setIsProdukDialogOpen(false)
      }, 500)
    }
  }

  const isAllProdukSelected = selectedProdukRows.length === produks.length && produks.length > 0
  const handleSelectAllProduk = (checked: boolean) => {
    if (checked) {
      setSelectedProdukRows(produks.map((p) => p.id))
    } else {
      setSelectedProdukRows([])
    }
  }
  const handleSelectRowProduk = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProdukRows((prev) => [...prev, id])
    } else {
      setSelectedProdukRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

"""

ui_produk_block = """            {activeMenu === 'produk' && (
              <div className="flex flex-col gap-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Manajemen Produk</h2>
                  <div className="flex items-center gap-2">
                    {selectedProdukRows.length > 0 && (
                      <Button variant="secondary" onClick={handleDeleteProduk}>Hapus ({selectedProdukRows.length})</Button>
                    )}
                    <Button onClick={handleAddClickProduk}>Tambah Produk</Button>
                    <Dialog open={isProdukDialogOpen} onOpenChange={setIsProdukDialogOpen}>
                      <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl md:text-2xl">{editingProdukId ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                          <div className="flex flex-col gap-6 order-2 md:order-1">
                            <div className="grid w-full gap-2">
                              <Label htmlFor="produk-title" className="text-base">Nama Produk</Label>
                              <Input
                                id="produk-title"
                                value={newProduk.title}
                                onChange={(e) => setNewProduk({ ...newProduk, title: e.target.value })}
                                placeholder="Misal: Minyak Goreng"
                                className="h-12"
                              />
                            </div>
                            <div className="grid w-full gap-2">
                              <Label htmlFor="produk-price" className="text-base">Harga</Label>
                              <Input
                                id="produk-price"
                                value={newProduk.price}
                                onChange={(e) => setNewProduk({ ...newProduk, price: e.target.value })}
                                placeholder="Misal: Rp 15.000"
                                className="h-12"
                              />
                            </div>
                            <div className="grid w-full gap-2">
                              <Label htmlFor="produk-src" className="text-base">Upload Gambar</Label>
                              <div className="relative w-full h-12">
                                <Input
                                  id="produk-src"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      setProdukFileName(file.name)
                                      const reader = new FileReader()
                                      reader.onloadend = () => {
                                        setNewProduk({ ...newProduk, src: reader.result as string })
                                      }
                                      reader.readAsDataURL(file)
                                    } else {
                                      setProdukFileName("")
                                      setNewProduk({ ...newProduk, src: "" })
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <Label
                                  htmlFor="produk-src"
                                  className="cursor-pointer flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                  <span className={`truncate mr-2 font-normal text-base ${produkFileName ? "text-foreground" : "text-muted-foreground"}`}>
                                    {produkFileName || "Tidak ada yang dipilih"}
                                  </span>
                                  <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shrink-0">
                                    Pilih File
                                  </span>
                                </Label>
                              </div>
                            </div>
                            <div className="pt-4">
                              <Button onClick={handleSaveProduk} className="h-12 w-full text-base" disabled={isSavingProduk}>
                                {isSavingProduk ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Menyimpan...
                                  </>
                                ) : (
                                  editingProdukId ? "Edit" : "Simpan Produk"
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-col items-center md:items-end justify-center w-full order-1 md:order-2 mb-2 md:mb-0">
                            <div className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] relative rounded-md border border-input overflow-hidden bg-muted/30 aspect-[4/5] shadow-sm">
                              {newProduk.src ? (
                                <img src={newProduk.src} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm text-center p-4">
                                  Pratinjau Gambar (4:5)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[50px] text-center border-r">
                          <Checkbox
                            aria-label="Select all"
                            checked={isAllProdukSelected}
                            onCheckedChange={handleSelectAllProduk}
                          />
                        </TableHead>
                        <TableHead className="w-[80px] border-r text-center">Foto</TableHead>
                        <TableHead className="border-r">Nama Produk</TableHead>
                        <TableHead className="border-r">Harga</TableHead>
                        <TableHead className="border-r text-center w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produks.map((produk) => (
                        <TableRow key={produk.id}>
                          <TableCell className="text-center border-r">
                            <Checkbox
                              aria-label={`Select ${produk.title}`}
                              checked={selectedProdukRows.includes(produk.id)}
                              onCheckedChange={(c) => handleSelectRowProduk(produk.id, !!c)}
                            />
                          </TableCell>
                          <TableCell className="border-r p-2 cursor-pointer hover:bg-accent/50" onClick={() => handleEditClickProduk(produk)}>
                            <img
                              src={produk.src}
                              alt={produk.title}
                              className="w-12 h-[60px] rounded-md object-cover border mx-auto"
                            />
                          </TableCell>
                          <TableCell className="font-medium border-r cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClickProduk(produk)}>{produk.title}</TableCell>
                          <TableCell className="border-r cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleEditClickProduk(produk)}>{produk.price}</TableCell>
                          <TableCell className="border-r text-center">
                            <Switch defaultChecked={true} aria-label={`Toggle status ${produk.title}`} />
                          </TableCell>
                        </TableRow>
                      ))}
                      {produks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Tidak ada data produk.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}\n"""

new_lines = []
skip = False
for line in lines:
    if dummy_pilihan_marker in line:
        new_lines.append(dummy_produk)
    if state_pilihan_marker in line:
        new_lines.append(state_produk)
    
    if ui_placeholder_marker in line:
        skip = True
        new_lines.append(ui_produk_block)
    
    if skip and "          {activeMenu === 'poin' && (" in line:
        skip = False
        
    if not skip:
        new_lines.append(line)

with open('app/settings/page.tsx', 'w') as f:
    for line in new_lines:
        f.write(line)

print("Insertion complete.")
