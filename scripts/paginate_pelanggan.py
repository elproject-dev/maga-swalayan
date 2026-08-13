import sys

with open('app/pelanggan/page.tsx', 'r') as f:
    text = f.read()

import_stmt = 'import { TablePagination } from "@/components/table-pagination"\n'
if 'import { TablePagination }' not in text:
    text = text.replace('import { Switch } from "@/components/ui/switch"', 'import { Switch } from "@/components/ui/switch"\n' + import_stmt)

# Add state
if 'const [currentPage, setCurrentPage] = useState(1)' not in text:
    text = text.replace('const [customers, setCustomers] = useState(initialCustomers)', 'const [customers, setCustomers] = useState(initialCustomers)\n  const [currentPage, setCurrentPage] = useState(1)')

# Slice data
text = text.replace('{customers.map((customer, index) => (', '{customers.slice((currentPage - 1) * 20, currentPage * 20).map((customer, index) => (')

# Fix numbering
text = text.replace('{index + 1}', '{(currentPage - 1) * 20 + index + 1}')

# Add pagination component
pagination_comp = """        </Table>
        <TablePagination 
          currentPage={currentPage} 
          totalPages={Math.ceil(customers.length / 20)} 
          onPageChange={setCurrentPage} 
        />
      </div>"""
text = text.replace('        </Table>\n      </div>', pagination_comp)

with open('app/pelanggan/page.tsx', 'w') as f:
    f.write(text)

print("Paginated pelanggan")
