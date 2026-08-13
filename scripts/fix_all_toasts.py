import sys

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

# Replace all alerts with toast.error
text = text.replace('alert("Storage penuh! Gagal menyimpan gambar karena ukuran terlalu besar.")', 'toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")')

# Now let's carefully replace handleSavePromo
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
                toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
              }
          } else {
            const updated = [{ ...newPromo, id: Date.now() }, ...promos]
            setPromos(updated)
            try {
                localStorage.setItem('promos', JSON.stringify(updated))
              } catch (e) {
                toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
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
                reject("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
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
                toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
              }
          } else {
            const updated = [{ ...newPilihan, id: Date.now() }, ...pilihans]
            setPilihans(updated)
            try {
                localStorage.setItem('pilihans', JSON.stringify(updated))
              } catch (e) {
                toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
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
                reject("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
              }
            }, 800)
          }),
          {
            loading: "Menyimpan pilihan...",
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
                toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
              }
          } else {
            const updated = [{ ...newProduk, id: Date.now() }, ...produks]
            setProduks(updated)
            try {
                localStorage.setItem('produks', JSON.stringify(updated))
              } catch (e) {
                toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
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
                reject("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")
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

print("Applied toast promise and removed alerts")
