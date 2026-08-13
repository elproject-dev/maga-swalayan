import sys

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

compress_fn = """
const compressImage = (file: File, callback: (base64: string) => void) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const MAX_WIDTH = 800
      const MAX_HEIGHT = 800
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height)
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        callback(canvas.toDataURL("image/jpeg", 0.6))
      } else {
        callback(e.target?.result as string)
      }
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}
"""

if 'const compressImage =' not in text:
    text = text.replace('export default function SettingsPage() {', compress_fn + '\nexport default function SettingsPage() {')

# Replace promo file input
old_promo_input = """                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setNewPromo({ ...newPromo, src: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)"""
new_promo_input = """                                        compressImage(file, (base64) => {
                                          setNewPromo({ ...newPromo, src: base64 })
                                        })"""
text = text.replace(old_promo_input, new_promo_input)

# Replace pilihan file input
old_pilihan_input = """                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setNewPilihan({ ...newPilihan, src: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)"""
new_pilihan_input = """                                        compressImage(file, (base64) => {
                                          setNewPilihan({ ...newPilihan, src: base64 })
                                        })"""
text = text.replace(old_pilihan_input, new_pilihan_input)

# Replace produk file input
old_produk_input = """                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setNewProduk({ ...newProduk, src: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)"""
new_produk_input = """                                        compressImage(file, (base64) => {
                                          setNewProduk({ ...newProduk, src: base64 })
                                        })"""
text = text.replace(old_produk_input, new_produk_input)

# Add try catch to handleSavePromo
text = text.replace("localStorage.setItem('promos', JSON.stringify(updated))", 
"""try {
              localStorage.setItem('promos', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }""")

# Add try catch to handleSavePilihan
text = text.replace("localStorage.setItem('pilihans', JSON.stringify(updated))",
"""try {
              localStorage.setItem('pilihans', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }""")

# Add try catch to handleSaveProduk
text = text.replace("localStorage.setItem('produks', JSON.stringify(updated))",
"""try {
              localStorage.setItem('produks', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }""")

with open('app/settings/page.tsx', 'w') as f:
    f.write(text)

print("Fixed quota issue")
