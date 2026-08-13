import sys

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Fix PromoGallery
promo_old = """      {images.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""
promo_new = """      {images.map((item) => (
        <Card key={item.id} onClick={() => setSelectedImage(item.src)} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""

promo_old_end = """              </p>
            </div>
          </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
            <img src={item.src} alt={item.title} className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />
          </DialogContent>
        </Dialog>
      ))}"""
promo_new_end = """              </p>
            </div>
          </div>
        </Card>
      ))}"""

text = text.replace(promo_old, promo_new)
text = text.replace(promo_old_end, promo_new_end)

# Add selectedImage state and the single Dialog to PromoGallery
text = text.replace('const [images, setImages] = React.useState(galleryImages);', 'const [images, setImages] = React.useState(galleryImages);\n  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);')

promo_return = """    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">"""
text = text.replace(promo_return, """    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">""")
text = text.replace("""      ))}
    </div>
  )""", """      ))}
    </div>
    </>
  )""")


# Fix PilihanHariIniGallery
pilihan_old = """      {items.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""
pilihan_new = """      {items.map((item) => (
        <Card key={item.id} onClick={() => setSelectedImage(item.src)} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""

pilihan_old_end = """              </p>
            </div>
          </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
            <img src={item.src} alt={item.title} className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />
          </DialogContent>
        </Dialog>
      ))}"""
pilihan_new_end = """              </p>
            </div>
          </div>
        </Card>
      ))}"""

text = text.replace(pilihan_old, pilihan_new)
text = text.replace(pilihan_old_end, pilihan_new_end)

text = text.replace('const [items, setItems] = React.useState(pilihanHariIni);', 'const [items, setItems] = React.useState(pilihanHariIni);\n  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);')

pilihan_return = """    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">"""
text = text.replace(pilihan_return, """    <>
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />}
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">""")

text = text.replace("""      ))}
    </div>
  )
}""", """      ))}
    </div>
    </>
  )
}""")

with open('app/page.tsx', 'w') as f:
    f.write(text)

print("Fixed dialog state")
