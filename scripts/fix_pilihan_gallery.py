import re

with open('app/page.tsx', 'r') as f:
    text = f.read()

replacement = """export function PilihanHariIniGallery() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [items, setItems] = React.useState(pilihanHariIni);

  React.useEffect(() => {
    const saved = localStorage.getItem('pilihans');
    if (saved) {
      setItems(JSON.parse(saved));
    }
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
"""

text = re.sub(r'export function PilihanHariIniGallery\(\) \{\n  return \(\n    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">\n      \{pilihanHariIni\.map\(\(item\) => \(', replacement, text)

with open('app/page.tsx', 'w') as f:
    f.write(text)

print("Fixed PilihanHariIniGallery")
