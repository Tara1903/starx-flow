"use client";

import React, { useState, useMemo, useEffect } from "react";
import { products as allProducts, Product } from "@/lib/productData";
import { CollectionHero } from "./CollectionHero";
import { CollectionStats } from "./CollectionStats";
import { CategorySwitcher } from "./CategorySwitcher";
import { StickyFilterBar } from "./StickyFilterBar";
import { FilterSidebar } from "./FilterSidebar";
import { ProductGrid } from "./ProductGrid";
import { EmptyState } from "./EmptyState";
import { LoadMore } from "./LoadMore";
import { QuickViewModal } from "./QuickViewModal";

export function CollectionPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState({
    healthGoals: [] as string[],
    productTypes: [] as string[],
    dietPreferences: [] as string[],
    priceRange: [0, 1500] as [number, number],
    availability: false,
    benefits: [] as string[],
  });

  // Handle responsive isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.benefit.toLowerCase().includes(q)
      );
    }

    // Health Goals
    if (filters.healthGoals.length > 0) {
      result = result.filter((p) =>
        filters.healthGoals.some((goal) => p.healthGoals.includes(goal))
      );
    }

    // Product Type
    if (filters.productTypes.length > 0) {
      result = result.filter((p) => filters.productTypes.includes(p.productType));
    }

    // Diet Preferences
    if (filters.dietPreferences.length > 0) {
      result = result.filter((p) =>
        filters.dietPreferences.some((diet) => p.dietPreference.includes(diet))
      );
    }

    // Benefits (checking ingredients/benefits)
    if (filters.benefits.length > 0) {
      result = result.filter((p) =>
        filters.benefits.some((b) => p.benefit.includes(b) || p.ingredients.includes(b))
      );
    }

    // Price Range
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Availability
    if (filters.availability) {
      result = result.filter((p) => p.availability === "In Stock");
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (a.badge === "New" ? -1 : b.badge === "New" ? 1 : 0));
        break;
      default:
        // Featured
        result.sort((a, b) => (a.badge === "Bestseller" ? -1 : b.badge === "Bestseller" ? 1 : 0));
        break;
    }

    return result;
  }, [activeCategory, searchQuery, sortBy, filters]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const remainingCount = filteredProducts.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(8);
  };

  const activeFilterCount =
    filters.healthGoals.length +
    filters.productTypes.length +
    filters.dietPreferences.length +
    filters.benefits.length +
    (filters.availability ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1500 ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      healthGoals: [],
      productTypes: [],
      dietPreferences: [],
      priceRange: [0, 1500],
      availability: false,
      benefits: [],
    });
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col">
      <CollectionHero activeCategory={activeCategory} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full -mt-8 relative z-20 mb-12">
        <CollectionStats />
      </div>

      <div className="mb-6 border-b border-white/5 pb-6">
        <CategorySwitcher
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      <StickyFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        activeFilterCount={activeFilterCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        productCount={filteredProducts.length}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 flex flex-col md:flex-row gap-8 items-start relative z-10">
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
          isMobile={isMobile}
        />

        <div className="flex-1 min-w-0">
          {filteredProducts.length === 0 ? (
            <EmptyState
              onResetFilters={resetFilters}
              onCategoryChange={handleCategoryChange}
            />
          ) : (
            <>
              <ProductGrid
                products={displayedProducts}
                viewMode={viewMode}
                onQuickView={setQuickViewProduct}
              />
              <LoadMore
                onLoadMore={handleLoadMore}
                remainingCount={remainingCount}
              />
            </>
          )}
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
