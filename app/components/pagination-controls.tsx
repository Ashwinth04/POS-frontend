import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

interface PaginationControlProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export function PaginationControl({
  page,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationControlProps) {
  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(0, page - half);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages);

  if (endPage - startPage < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages);
  }

  return (
    <div className="flex justify-end">
      <Pagination>
        <PaginationContent>
          {/* ⏮ First */}
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(0)}
              className={page === 0 ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {/* ◀ Previous */}
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(page - 1)}
              className={page === 0 ? "pointer-events-none opacity-50" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {/* Page Numbers */}
          {Array.from({ length: endPage - startPage }).map((_, idx) => {
            const pageIndex = startPage + idx;
            return (
              <PaginationItem key={pageIndex}>
                <PaginationLink
                  isActive={page === pageIndex}
                  onClick={() => onPageChange(pageIndex)}
                >
                  {pageIndex + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* ▶ Next */}
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(page + 1)}
              className={
                page === totalPages - 1 ? "pointer-events-none opacity-50" : ""
              }
            >
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {/* ⏭ Last */}
          <PaginationItem>
            <PaginationLink
              onClick={() => onPageChange(totalPages - 1)}
              className={
                page === totalPages - 1 ? "pointer-events-none opacity-50" : ""
              }
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
