import sys

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

import_stmt = 'import { TablePagination } from "@/components/table-pagination"\n'
if 'import { TablePagination }' not in text:
    text = text.replace('import { Button } from "@/components/ui/button"', 'import { Button } from "@/components/ui/button"\n' + import_stmt)

# Add state and effect
state_injection = """  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeMenu])"""
text = text.replace('  const [activeMenu, setActiveMenu] = useState<string | null>(null)', state_injection)

# Replace mapping
text = text.replace('{promos.map((promo) => (', '{promos.slice((currentPage - 1) * 20, currentPage * 20).map((promo) => (')
text = text.replace('{pilihans.map((pilihan) => (', '{pilihans.slice((currentPage - 1) * 20, currentPage * 20).map((pilihan) => (')
text = text.replace('{produks.map((produk) => (', '{produks.slice((currentPage - 1) * 20, currentPage * 20).map((produk) => (')

# We need to inject the TablePagination below each </Table>. 
# We can do this by finding specific TableBody ends or Table ends for each section.
# In settings, each table has a specific empty state.

# For Promo:
promo_table_end = """              {promos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Belum ada data promo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>"""
promo_pagination = promo_table_end + """
          <TablePagination 
            currentPage={currentPage} 
            totalPages={Math.ceil(promos.length / 20)} 
            onPageChange={setCurrentPage} 
          />"""
text = text.replace(promo_table_end, promo_pagination)

# For Pilihan:
pilihan_table_end = """              {pilihans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Belum ada data pilihan hari ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>"""
pilihan_pagination = pilihan_table_end + """
          <TablePagination 
            currentPage={currentPage} 
            totalPages={Math.ceil(pilihans.length / 20)} 
            onPageChange={setCurrentPage} 
          />"""
text = text.replace(pilihan_table_end, pilihan_pagination)

# For Produk:
produk_table_end = """              {produks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Belum ada data produk.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>"""
produk_pagination = produk_table_end + """
          <TablePagination 
            currentPage={currentPage} 
            totalPages={Math.ceil(produks.length / 20)} 
            onPageChange={setCurrentPage} 
          />"""
text = text.replace(produk_table_end, produk_pagination)

with open('app/settings/page.tsx', 'w') as f:
    f.write(text)

print("Paginated settings")
