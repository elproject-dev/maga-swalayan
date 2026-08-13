import re

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

# 1. Rip out dummyProdukHariIni
text = re.sub(r'const dummyProdukHariIni = \[.*?\];\n', '', text, flags=re.DOTALL)

# 2. Rip out the broken state_produk (which was inserted inside `if (!isMounted) {`)
# It starts with `const [produks, setProduks]` and ends with another `if (!isMounted) {`
text = re.sub(r'const \[produks, setProduks\].*?if \(!isMounted\) \{', '', text, flags=re.DOTALL)

# 3. Rip out ui_produk so we can do it properly later.
# It starts with `{activeMenu === \'produk\' && \(` and ends with `Tidak ada data produk.*?</Table>.*?</div>.*?</div>.*?}`
text = re.sub(r'\{activeMenu === \'produk\' && \(.*?Tidak ada data produk\..*?</Table>.*?</div>.*?</div>\s*\)', 
'''{activeMenu === \'produk\' && (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border rounded-xl border-dashed">
    <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
    <h3 className="text-lg font-medium">Manajemen Produk</h3>
    <p className="text-sm text-muted-foreground mt-1">Pengaturan menu ini akan segera hadir.</p>
  </div>
)}''', text, flags=re.DOTALL)

with open('app/settings/page.tsx', 'w') as f:
    f.write(text)

print("Cleaned up!")
