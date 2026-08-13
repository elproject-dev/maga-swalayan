import sys

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

if 'import { toast } from "@/components/ui/toast"' not in text:
    text = text.replace('import { Loader2, Plus, Search, Trash2, Edit2 } from "lucide-react"', 'import { Loader2, Plus, Search, Trash2, Edit2 } from "lucide-react"\nimport { toast } from "@/components/ui/toast"')


# Replace handleSavePromo
old_promo = """    const handleSavePromo = () => {
      if (newPromo.title && newPromo.promo && newPromo.src) {
        setIsSaving(true)
        setTimeout(() => {
          if (editingId) {
            const updated = promos.map(p => p.id === editingId ? { ...p, ...newPromo } : p)
            setPromos(updated)
            try {
              localStorage.setItem('promos', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }
          } else {
            const updated = [{ ...newPromo, id: Date.now() }, ...promos]
            setPromos(updated)
            try {
              localStorage.setItem('promos', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }
          }
          setIsSaving(false)
          setIsDialogOpen(false)
        }, 500)
      }
    }"""

new_promo = """    const handleSavePromo = () => {
      if (newPromo.title && newPromo.promo && newPromo.src) {
        setIsSaving(true)
        
        toast.promise(
          new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                if (editingId) {
                  const updated = promos.map(p => p.id === editingId ? { ...p, ...newPromo } : p)
                  setPromos(updated)
                  localStorage.setItem('promos', JSON.stringify(updated))
                } else {
                  const updated = [{ ...newPromo, id: Date.now() }, ...promos]
                  setPromos(updated)
                  localStorage.setItem('promos', JSON.stringify(updated))
                }
                resolve("Data berhasil disimpan!")
              } catch (e) {
                reject("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
              }
            }, 800)
          }),
          {
            loading: "Menyimpan promo...",
            success: (msg) => `${msg}`,
            error: (err) => `${err}`,
          }
        ).finally(() => {
          setIsSaving(false)
          setIsDialogOpen(false)
        })
      }
    }"""
text = text.replace(old_promo, new_promo)

# Replace handleSavePilihan
old_pilihan = """    const handleSavePilihan = () => {
      if (newPilihan.title && newPilihan.src) {
        setIsPilihanSaving(true)
        setTimeout(() => {
          if (editingPilihanId) {
            const updated = pilihans.map(p => p.id === editingPilihanId ? { ...p, ...newPilihan } : p)
            setPilihans(updated)
            try {
              localStorage.setItem('pilihans', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }
          } else {
            const updated = [{ ...newPilihan, id: Date.now() }, ...pilihans]
            setPilihans(updated)
            try {
              localStorage.setItem('pilihans', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }
          }
          setIsPilihanSaving(false)
          setIsPilihanDialogOpen(false)
        }, 500)
      }
    }"""

new_pilihan = """    const handleSavePilihan = () => {
      if (newPilihan.title && newPilihan.src) {
        setIsPilihanSaving(true)
        
        toast.promise(
          new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                if (editingPilihanId) {
                  const updated = pilihans.map(p => p.id === editingPilihanId ? { ...p, ...newPilihan } : p)
                  setPilihans(updated)
                  localStorage.setItem('pilihans', JSON.stringify(updated))
                } else {
                  const updated = [{ ...newPilihan, id: Date.now() }, ...pilihans]
                  setPilihans(updated)
                  localStorage.setItem('pilihans', JSON.stringify(updated))
                }
                resolve("Data berhasil disimpan!")
              } catch (e) {
                reject("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
              }
            }, 800)
          }),
          {
            loading: "Menyimpan data...",
            success: (msg) => `${msg}`,
            error: (err) => `${err}`,
          }
        ).finally(() => {
          setIsPilihanSaving(false)
          setIsPilihanDialogOpen(false)
        })
      }
    }"""
text = text.replace(old_pilihan, new_pilihan)

# Replace handleSaveProduk
old_produk = """    const handleSaveProduk = () => {
      if (newProduk.title && newProduk.price && newProduk.src) {
        setIsProdukSaving(true)
        setTimeout(() => {
          if (editingProdukId) {
            const updated = produks.map(p => p.id === editingProdukId ? { ...p, ...newProduk } : p)
            setProduks(updated)
            try {
              localStorage.setItem('produks', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }
          } else {
            const updated = [{ ...newProduk, id: Date.now() }, ...produks]
            setProduks(updated)
            try {
              localStorage.setItem('produks', JSON.stringify(updated))
            } catch (e) {
              alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
            }
          }
          setIsProdukSaving(false)
          setIsProdukDialogOpen(false)
        }, 500)
      }
    }"""

new_produk = """    const handleSaveProduk = () => {
      if (newProduk.title && newProduk.price && newProduk.src) {
        setIsProdukSaving(true)
        
        toast.promise(
          new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                if (editingProdukId) {
                  const updated = produks.map(p => p.id === editingProdukId ? { ...p, ...newProduk } : p)
                  setProduks(updated)
                  localStorage.setItem('produks', JSON.stringify(updated))
                } else {
                  const updated = [{ ...newProduk, id: Date.now() }, ...produks]
                  setProduks(updated)
                  localStorage.setItem('produks', JSON.stringify(updated))
                }
                resolve("Data berhasil disimpan!")
              } catch (e) {
                reject("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")
              }
            }, 800)
          }),
          {
            loading: "Menyimpan produk...",
            success: (msg) => `${msg}`,
            error: (err) => `${err}`,
          }
        ).finally(() => {
          setIsProdukSaving(false)
          setIsProdukDialogOpen(false)
        })
      }
    }"""
text = text.replace(old_produk, new_produk)

with open('app/settings/page.tsx', 'w') as f:
    f.write(text)

print("Added toast promise")
