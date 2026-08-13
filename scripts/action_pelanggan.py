import sys

with open('app/pelanggan/page.tsx', 'r') as f:
    text = f.read()

# Add imports
imports = """import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
"""
if 'import { Button }' not in text:
    text = text.replace('import { Switch } from "@/components/ui/switch"', 'import { Switch } from "@/components/ui/switch"\n' + imports)

# Add states and handlers
state_block = """  const [currentPage, setCurrentPage] = useState(1)
  const [isActionMode, setIsActionMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(customers.map((c) => c.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id])
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleDelete = () => {
    setCustomers(customers.filter(c => !selectedRows.includes(c.id)))
    setSelectedRows([])
    setIsActionMode(false)
  }

  const isAllSelected = selectedRows.length === customers.length && customers.length > 0
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < customers.length"""
text = text.replace('  const [currentPage, setCurrentPage] = useState(1)', state_block)

# Add header buttons
header_block = """      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Daftar Pelanggan</h1>
        <div className="flex gap-2">
          {isActionMode ? (
            <>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={selectedRows.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Terpilih ({selectedRows.length})
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsActionMode(false)
                  setSelectedRows([])
                }}
              >
                Batal
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsActionMode(true)}>
              Aksi
            </Button>
          )}
        </div>
      </div>"""
old_header = """      <div className="flex flex-col">
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight">Daftar Pelanggan</h1>

      </div>"""
text = text.replace(old_header, header_block)

# Replace table head NO
old_th = '<TableHead className="w-[50px] text-center border-r">No</TableHead>'
new_th = """<TableHead className="w-[50px] text-center border-r">
                {isActionMode ? (
                  <div className="flex justify-center">
                    <Checkbox 
                      checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                ) : (
                  "No"
                )}
              </TableHead>"""
text = text.replace(old_th, new_th)

# Replace table cell NO
old_td = """                <TableCell className="text-center border-r font-medium text-muted-foreground">
                  {(currentPage - 1) * 20 + index + 1}
                </TableCell>"""
new_td = """                <TableCell className="text-center border-r font-medium text-muted-foreground">
                  {isActionMode ? (
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={selectedRows.includes(customer.id)}
                        onCheckedChange={(c) => handleSelectRow(customer.id, !!c)}
                      />
                    </div>
                  ) : (
                    (currentPage - 1) * 20 + index + 1
                  )}
                </TableCell>"""
text = text.replace(old_td, new_td)

with open('app/pelanggan/page.tsx', 'w') as f:
    f.write(text)

print("Applied action mode to Pelanggan")
