import re

with open('app/settings/page.tsx', 'r') as f:
    lines = f.readlines()

pilihan_state_start = -1
pilihan_state_end = -1
pilihan_ui_start = -1
pilihan_ui_end = -1
pilihan_dummy_start = -1
pilihan_dummy_end = -1

# 1. Find dummy data block
for i, line in enumerate(lines):
    if "const dummyPilihanHariIni =" in line:
        pilihan_dummy_start = i
    if pilihan_dummy_start != -1 and "];" in line and i > pilihan_dummy_start:
        pilihan_dummy_end = i
        break

# 2. Find states and handlers block
for i, line in enumerate(lines):
    if "const [pilihans, setPilihans] = useState(dummyPilihanHariIni)" in line:
        pilihan_state_start = i
    if pilihan_state_start != -1 and "const isAllPilihanSelected" in line:
        # Actually handlers go all the way to `return (`
        pass
    if pilihan_state_start != -1 and "  return (" in line:
        pilihan_state_end = i - 1
        break

# 3. Find UI block
for i, line in enumerate(lines):
    if "          {activeMenu === 'pilihan' && (" in line:
        pilihan_ui_start = i
    if pilihan_ui_start != -1 and "          {activeMenu === 'produk' && (" in line:
        pilihan_ui_end = i - 1
        break
        
# 4. Find Produk UI placeholder block
produk_ui_start = -1
produk_ui_end = -1
for i, line in enumerate(lines):
    if "          {activeMenu === 'produk' && (" in line:
        produk_ui_start = i
    if produk_ui_start != -1 and "          {activeMenu === 'poin' && (" in line:
        produk_ui_end = i - 1
        break

dummy_block = "".join(lines[pilihan_dummy_start:pilihan_dummy_end+1])
state_block = "".join(lines[pilihan_state_start:pilihan_state_end+1])
ui_block = "".join(lines[pilihan_ui_start:pilihan_ui_end+1])

def transform_pilihan_to_produk(text):
    t = text
    t = t.replace("Pilihan", "Produk")
    t = t.replace("pilihan", "produk")
    t = t.replace("PILIHAN", "PRODUK")
    t = t.replace("Hari Ini", "") # "Pilihan Hari Ini" -> "Produk "
    t = t.replace("Produk  ", "Produk ") 
    return t

dummy_produk = transform_pilihan_to_produk(dummy_block)
state_produk = transform_pilihan_to_produk(state_block)

# Since we want to insert dummy_produk right after dummy_block
lines.insert(pilihan_dummy_end + 1, "\n" + dummy_produk)

# Recalculate offsets after insertion
for i, line in enumerate(lines):
    if "  return (" in line:
        pilihan_state_end = i - 1
        break

lines.insert(pilihan_state_end + 1, state_produk + "\n")

# Re-find the Produk placeholder
produk_ui_start = -1
produk_ui_end = -1
for i, line in enumerate(lines):
    if "          {activeMenu === 'produk' && (" in line:
        produk_ui_start = i
    if produk_ui_start != -1 and "          {activeMenu === 'poin' && (" in line:
        produk_ui_end = i - 1
        break

ui_produk = transform_pilihan_to_produk(ui_block)

new_lines = lines[:produk_ui_start] + [ui_produk] + lines[produk_ui_end+1:]

with open('app/settings/page.tsx', 'w') as f:
    for line in new_lines:
        f.write(line)

print("Done generating produk settings")
