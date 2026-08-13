import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {


  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div className="py-4 flex items-center justify-center border-t">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {Array.from({ length: safeTotalPages }).map((_, i) => {
            const page = i + 1;
            // Simple logic: show first, last, and +/- 1 from current
            if (page === 1 || page === safeTotalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              const safeTotalPages = Math.max(1, totalPages);

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              const safeTotalPages = Math.max(1, totalPages);

              return (
                <PaginationItem key={page}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }
            return null;
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < safeTotalPages) onPageChange(currentPage + 1);
              }}
              className={currentPage >= safeTotalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
