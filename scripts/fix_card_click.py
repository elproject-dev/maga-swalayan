import sys

files = ['app/pilihan/page.tsx', 'app/produk/page.tsx']

for file in files:
    with open(file, 'r') as f:
        text = f.read()
    
    text = text.replace(
        '<Card key={item.id} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">',
        '<Card key={item.id} onClick={() => setSelectedImage(item.src)} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">'
    )
    
    with open(file, 'w') as f:
        f.write(text)

print("Fixed card click")
