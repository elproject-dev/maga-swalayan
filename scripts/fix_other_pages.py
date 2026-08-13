import sys

files = ['app/promo/page.tsx', 'app/pilihan/page.tsx', 'app/produk/page.tsx']

for file in files:
    with open(file, 'r') as f:
        text = f.read()
    
    # Add Dialog imports
    if 'import { Dialog, DialogContent } from "@/components/ui/dialog"' not in text:
        text = text.replace('import { Loader2 } from "lucide-react"', 'import { Loader2 } from "lucide-react"\nimport { Dialog, DialogContent } from "@/components/ui/dialog"')

    # Add selectedImage state
    if "const [images, setImages]" in text:
        text = text.replace('const [images, setImages] = useState(galleryImages)', 'const [images, setImages] = useState(galleryImages)\n  const [selectedImage, setSelectedImage] = useState<string | null>(null)')
    elif "const [pilihans, setPilihans]" in text:
        text = text.replace('const [pilihans, setPilihans] = useState(dummyPilihanHariIni)', 'const [pilihans, setPilihans] = useState(dummyPilihanHariIni)\n  const [selectedImage, setSelectedImage] = useState<string | null>(null)')
    elif "const [produks, setProduks]" in text:
        text = text.replace('const [produks, setProduks] = useState(dummyProdukHariIni)', 'const [produks, setProduks] = useState(dummyProdukHariIni)\n  const [selectedImage, setSelectedImage] = useState<string | null>(null)')

    # Add Dialog JSX and update Card click handler
    if 'app/promo' in file:
        return_stmt = '    <div className="@container/main flex flex-1 flex-col gap-2">'
        text = text.replace(return_stmt, """    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="@container/main flex flex-1 flex-col gap-2">""")
        
        text = text.replace('<Card key={item.id} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">',
                            '<Card key={item.id} onClick={() => setSelectedImage(item.src)} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">')
        
        text = text.replace("""      </div>
    </div>
  )
}""", """      </div>
    </div>
    </>
  )
}""")

    if 'app/pilihan' in file or 'app/produk' in file:
        return_stmt = '    <div className="@container/main flex flex-1 flex-col gap-2">'
        text = text.replace(return_stmt, """    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="@container/main flex flex-1 flex-col gap-2">""")
        
        if 'app/pilihan' in file:
            text = text.replace('<Card key={pilihan.id} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">',
                                '<Card key={pilihan.id} onClick={() => setSelectedImage(pilihan.src)} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">')
        else:
            text = text.replace('<Card key={produk.id} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">',
                                '<Card key={produk.id} onClick={() => setSelectedImage(produk.src)} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">')

        text = text.replace("""      </div>
    </div>
  )
}""", """      </div>
    </div>
    </>
  )
}""")

    with open(file, 'w') as f:
        f.write(text)

print("Updated all pages")
