"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "../lib/product-api";
import { Product } from "../types/product";
import ProductCard from "../../components/products/product-card";
import AddProductModal from "../../components/products/add-product-modal";
import BulkUploadModal from "../../components/bulk-upload-modal";
import { uploadInventoryTSV, uploadProductTSV } from "../lib/bulk-upload-api";

import AuthGuard from "../../components/AuthGuard";
import { PaginationControl } from "../../components/pagination-controls";

type SearchType = "name" | "barcode";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isSupervisor, setIsSupervisor] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  // 🔍 Search state
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Load current user role
  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("http://localhost:8080/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setIsSupervisor(data.role === "ROLE_SUPERVISOR");
        }
      } catch (err) {
        console.error("Failed to fetch role", err);
      } finally {
        setLoadingRole(false);
      }
    }
    fetchRole();
  }, []);

  async function load(p = 0, forceClear = false) {
    if (forceClear || !query.trim()) {
      const data = await fetchProducts(p, 8);
      setProducts(data.content);
      setPage(data.number);
      setTotalPages(data.totalPages);
      setIsSearching(false);
      return;
    }

    const res = await fetch(
      `http://localhost:8080/api/products/search?type=${searchType}&query=${encodeURIComponent(
        query,
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page: p, size: 8 }),
        credentials: "include",
      },
    );

    if (!res.ok) return;

    const data = await res.json();
    setProducts(data.content);
    setPage(data.number);
    setTotalPages(data.totalPages);
    setIsSearching(true);
  }

  useEffect(() => {
    load(0);
  }, []);

  if (loadingRole) return null;

  return (
    <AuthGuard allowedRoles={["ROLE_SUPERVISOR", "ROLE_OPERATOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold">Products</h1>
            <p className="text-muted-foreground text-sm">
              Manage product catalog and inventory
            </p>
          </div>

          {/* Buttons visible only to supervisors */}
          {isSupervisor && (
            <div className="flex gap-3">
              <BulkUploadModal
                title="Bulk Upload Products"
                templateUrl="/templates/products-bulk-upload-template.tsv"
                uploadFn={uploadProductTSV}
                successMessage="Products uploaded successfully"
                triggerLabel="Bulk Upload Products"
              />

              <BulkUploadModal
                title="Bulk Upload Inventory"
                templateUrl="/templates/inventory-bulk-upload-template.tsv"
                uploadFn={uploadInventoryTSV}
                successMessage="Inventory updated successfully"
                triggerLabel="Bulk Upload Inventory"
              />

              <AddProductModal onAdded={() => load(0)} />
            </div>
          )}
        </div>

        {/* 🔍 Search Bar (Premium Look) */}
        {/* 🔍 Search Controls */}
        <div className="flex items-center gap-3 max-w-xl">
          {/* Filter */}
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="name">Name</option>
            <option value="barcode">Barcode</option>
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder={`Search by ${searchType}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load(0);
            }}
            className="flex-1 h-10 rounded-lg border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Search */}
          <button
            onClick={() => load(0)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Search
          </button>

          {/* Clear */}
          <button
            onClick={() => {
              setQuery("");
              load(0, true);
            }}
            disabled={!query}
            className="h-10 px-4 rounded-lg border text-sm font-medium transition
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:bg-muted"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-col min-h-[calc(100vh-120px)]">
          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} canEdit={isSupervisor} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <PaginationControl
              page={page}
              totalPages={totalPages}
              onPageChange={load}
            />
          </div>
        </div>

      </div>
    </AuthGuard>
  );
}
