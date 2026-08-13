import sys

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

text = text.replace('toast.error("Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.")', 'toast.add({ title: "Error", description: "Storage penuh! Silakan hapus beberapa data lama terlebih dahulu.", type: "error" } as any)')

with open('app/settings/page.tsx', 'w') as f:
    f.write(text)

print("Fixed toast error calls")
