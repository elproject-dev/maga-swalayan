import sys

with open('app/settings/page.tsx', 'r') as f:
    text = f.read()

promo_pagination = """                    </Table>
                    <TablePagination 
                      currentPage={currentPage} 
                      totalPages={Math.ceil(promos.length / 5)} 
                      onPageChange={setCurrentPage} 
                    />"""
text = text.replace('                    </Table>', promo_pagination, 1)

pilihan_pagination = """                    </Table>
                    <TablePagination 
                      currentPage={currentPage} 
                      totalPages={Math.ceil(pilihans.length / 5)} 
                      onPageChange={setCurrentPage} 
                    />"""
text = text.replace('                    </Table>', pilihan_pagination, 1)

produk_pagination = """                    </Table>
                    <TablePagination 
                      currentPage={currentPage} 
                      totalPages={Math.ceil(produks.length / 5)} 
                      onPageChange={setCurrentPage} 
                    />"""
text = text.replace('                    </Table>', produk_pagination, 1)

with open('app/settings/page.tsx', 'w') as f:
    f.write(text)

print("Added pagination components")
