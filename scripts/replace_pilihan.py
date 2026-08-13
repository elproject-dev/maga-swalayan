import re

with open('app/settings/page.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
pilihan_start_idx = -1
pilihan_end_idx = -1

for i, line in enumerate(lines):
    if "activeMenu === 'promo' && (" in line:
        start_idx = i
    if start_idx != -1 and "          {activeMenu === 'pilihan' && (" in line:
        end_idx = i - 1
        pilihan_start_idx = i
    if pilihan_start_idx != -1 and "          {activeMenu === 'produk' && (" in line:
        pilihan_end_idx = i - 1
        break

promo_block = "".join(lines[start_idx:end_idx])

# Now modify promo_block for pilihan
pilihan_block = promo_block
pilihan_block = pilihan_block.replace("activeMenu === 'promo'", "activeMenu === 'pilihan'")
pilihan_block = pilihan_block.replace("Manajemen Promo", "Pilihan Hari Ini")
pilihan_block = pilihan_block.replace("selectedRows", "selectedPilihanRows")
pilihan_block = pilihan_block.replace("handleDelete", "handleDeletePilihan")
pilihan_block = pilihan_block.replace("handleAddClick", "handleAddClickPilihan")
pilihan_block = pilihan_block.replace("isDialogOpen", "isPilihanDialogOpen")
pilihan_block = pilihan_block.replace("setIsDialogOpen", "setIsPilihanDialogOpen")
pilihan_block = pilihan_block.replace("editingId", "editingPilihanId")
pilihan_block = pilihan_block.replace("Edit Promo", "Edit Pilihan")
pilihan_block = pilihan_block.replace("Tambah Promo Baru", "Tambah Pilihan Baru")
pilihan_block = pilihan_block.replace("newPromo", "newPilihan")
pilihan_block = pilihan_block.replace("setNewPromo", "setNewPilihan")
pilihan_block = pilihan_block.replace("Nama Promo", "Nama Produk")
pilihan_block = pilihan_block.replace("htmlFor=\"promo\"", "htmlFor=\"price\"")
pilihan_block = pilihan_block.replace("id=\"promo\"", "id=\"price\"")
pilihan_block = pilihan_block.replace("newPilihan.promo", "newPilihan.price")
pilihan_block = pilihan_block.replace("title: e.target.value", "title: e.target.value")
pilihan_block = pilihan_block.replace("promo: e.target.value", "price: e.target.value")
pilihan_block = pilihan_block.replace("Misal: Diskon 20%", "Misal: Rp 15.000")
pilihan_block = pilihan_block.replace("Keterangan", "Harga")
pilihan_block = pilihan_block.replace("fileName", "pilihanFileName")
pilihan_block = pilihan_block.replace("setFileName", "setPilihanFileName")
pilihan_block = pilihan_block.replace("handleSavePromo", "handleSavePilihan")
pilihan_block = pilihan_block.replace("isSaving", "isSavingPilihan")
pilihan_block = pilihan_block.replace("Simpan Promo", "Simpan Pilihan")
pilihan_block = pilihan_block.replace("promos.", "pilihans.")
pilihan_block = pilihan_block.replace("promos =", "pilihans =")
pilihan_block = pilihan_block.replace("promos)", "pilihans)")
pilihan_block = pilihan_block.replace("promos.map((promo)", "pilihans.map((pilihan)")
pilihan_block = pilihan_block.replace("promo.id", "pilihan.id")
pilihan_block = pilihan_block.replace("promo.title", "pilihan.title")
pilihan_block = pilihan_block.replace("promo.promo", "pilihan.price")
pilihan_block = pilihan_block.replace("promo.src", "pilihan.src")
pilihan_block = pilihan_block.replace("isAllSelected", "isAllPilihanSelected")
pilihan_block = pilihan_block.replace("handleSelectAll", "handleSelectAllPilihan")
pilihan_block = pilihan_block.replace("handleSelectRow", "handleSelectRowPilihan")
pilihan_block = pilihan_block.replace("handleEditClick", "handleEditClickPilihan")
pilihan_block = pilihan_block.replace("Tidak ada data promo.", "Tidak ada data pilihan.")

# Assemble the new lines
new_lines = lines[:pilihan_start_idx] + [pilihan_block + "\n"] + lines[pilihan_end_idx+1:]

with open('app/settings/page.tsx', 'w') as f:
    f.writelines(new_lines)

print("Done replacing.")
