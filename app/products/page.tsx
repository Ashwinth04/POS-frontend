"use client"

import { useEffect, useState } from "react"
import { fetchProducts } from "../lib/product-api"
import { Product } from "../types/product"
import ProductCard from "../components/products/product-card"
import AddProductModal from "../components/products/add-product-modal"
import BulkUploadModal from "../components/products/bulk-upload-modal"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import AuthGuard from "../components/AuthGuard"
import InventoryBulkUpdateModal from "../components/products/inventory-bulk-upload-modal"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  async function load(p = 0) {
    const data = await fetchProducts(p, 8)
    setProducts(data.content)
    setPage(data.number)
    setTotalPages(data.totalPages)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR"]}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage product catalog and inventory
          </p>
        </div>

        <div className="flex gap-3">
          <InventoryBulkUpdateModal />
          <BulkUploadModal />
          <AddProductModal onAdded={() => load(0)} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => load(Math.max(page - 1, 0))}
                className={page === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i} onClick={() => load(i)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => load(Math.min(page + 1, totalPages - 1))}
                className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
    </AuthGuard>
  )
}
