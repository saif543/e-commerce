"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Grid3X3, LayoutList, Star, SlidersHorizontal, X } from "lucide-react";
import { products } from "@/data/products";

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Biggest Discount", value: "discount" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
  { label: "Newest First", value: "newest" },
];

function FilterSection({ title, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 px-1 text-left"
      >
        <span className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterContent({
  openFilter, toggleFilter,
  priceMin, priceMax, setPriceMin, setPriceMax,
  allBrands, selectedBrands, setSelectedBrands,
  connectivityOptions, selectedConnectivity, setSelectedConnectivity,
  selectedDiscount, setSelectedDiscount,
  conditionOptions, selectedCondition, setSelectedCondition,
  availabilityOptions, selectedAvailability, setSelectedAvailability,
  toggleItem,
}) {
  return (
    <>
      <FilterSection title="Price" isOpen={openFilter === "price"} onToggle={() => toggleFilter("price")}>
        <div className="text-center text-sm font-medium text-text-primary mb-3">
          ৳{priceMin.toLocaleString()} – ৳{priceMax.toLocaleString()}
        </div>
        <input type="range" min={0} max={500} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-purple-mid mb-3" />
        <div className="flex items-center gap-3">
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center outline-none focus:border-purple-mid transition-colors" placeholder="Min" />
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(Math.min(500, Number(e.target.value)))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center outline-none focus:border-purple-mid transition-colors" placeholder="Max" />
        </div>
      </FilterSection>

      <FilterSection title="Brands" isOpen={openFilter === "brands"} onToggle={() => toggleFilter("brands")}>
        <div className="space-y-2.5 max-h-52 overflow-y-auto">
          {allBrands.map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedBrands.includes(brand) ? "bg-purple-mid border-purple-mid" : "border-gray-300 group-hover:border-purple-light"
                }`}
                onClick={() => toggleItem(selectedBrands, setSelectedBrands, brand)}
              >
                {selectedBrands.includes(brand) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
              <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? "text-text-primary font-medium" : "text-text-secondary group-hover:text-text-primary"}`} onClick={() => toggleItem(selectedBrands, setSelectedBrands, brand)}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Connectivity" isOpen={openFilter === "connectivity"} onToggle={() => toggleFilter("connectivity")}>
        <div className="space-y-2.5">
          {connectivityOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedConnectivity.includes(opt) ? "bg-purple-mid border-purple-mid" : "border-gray-300 group-hover:border-purple-light"
                }`}
                onClick={() => toggleItem(selectedConnectivity, setSelectedConnectivity, opt)}
              >
                {selectedConnectivity.includes(opt) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
              <span className={`text-sm transition-colors ${selectedConnectivity.includes(opt) ? "text-text-primary font-medium" : "text-text-secondary group-hover:text-text-primary"}`} onClick={() => toggleItem(selectedConnectivity, setSelectedConnectivity, opt)}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Discount" isOpen={openFilter === "discount"} onToggle={() => toggleFilter("discount")}>
        <div className="space-y-2">
          {[40, 30, 20, 10].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDiscount(selectedDiscount === d ? null : d)}
              className={`flex items-center gap-2 w-full py-1.5 px-2 rounded-lg text-sm transition-colors ${
                selectedDiscount === d ? "bg-purple-soft text-purple-dark font-medium" : "text-text-secondary hover:bg-gray-50"
              }`}
            >
              {d}% or more
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Condition" isOpen={openFilter === "condition"} onToggle={() => toggleFilter("condition")}>
        <div className="space-y-2.5">
          {conditionOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedCondition.includes(opt) ? "bg-purple-mid border-purple-mid" : "border-gray-300 group-hover:border-purple-light"
                }`}
                onClick={() => toggleItem(selectedCondition, setSelectedCondition, opt)}
              >
                {selectedCondition.includes(opt) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
              <span className={`text-sm transition-colors ${selectedCondition.includes(opt) ? "text-text-primary font-medium" : "text-text-secondary group-hover:text-text-primary"}`} onClick={() => toggleItem(selectedCondition, setSelectedCondition, opt)}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability" isOpen={openFilter === "availability"} onToggle={() => toggleFilter("availability")}>
        <div className="space-y-2.5">
          {availabilityOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedAvailability.includes(opt) ? "bg-purple-mid border-purple-mid" : "border-gray-300 group-hover:border-purple-light"
                }`}
                onClick={() => toggleItem(selectedAvailability, setSelectedAvailability, opt)}
              >
                {selectedAvailability.includes(opt) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
              <span className={`text-sm transition-colors ${selectedAvailability.includes(opt) ? "text-text-primary font-medium" : "text-text-secondary group-hover:text-text-primary"}`} onClick={() => toggleItem(selectedAvailability, setSelectedAvailability, opt)}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );
}

export default function CategoryPage({ categoryName, parentName, parentSlug, subcategories, isParent }) {
  const [sortBy, setSortBy] = useState("default");
  const [gridView, setGridView] = useState("grid");
  const [openFilter, setOpenFilter] = useState("price");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConnectivity, setSelectedConnectivity] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState([]);

  const toggleFilter = (key) => {
    setOpenFilter((prev) => (prev === key ? null : key));
  };

  const allBrands = [...new Set(products.map((p) => p.brand))];
  const connectivityOptions = ["Wireless", "Bluetooth", "USB-C", "Wi-Fi", "NFC", "3.5mm Jack"];
  const conditionOptions = ["Brand New", "Refurbished", "Open Box"];
  const availabilityOptions = ["In Stock", "Pre-Order", "Upcoming", "Out of Stock"];

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedConnectivity.length > 0 ||
    selectedDiscount !== null ||
    selectedAvailability.length > 0 ||
    selectedCondition.length > 0 ||
    priceMax < 500 ||
    priceMin > 0;

  const resetAll = () => {
    setPriceMin(0);
    setPriceMax(500);
    setSelectedBrands([]);
    setSelectedConnectivity([]);
    setSelectedDiscount(null);
    setSelectedAvailability([]);
    setSelectedCondition([]);
  };

  const toggleItem = (list, setList, item) => {
    setList((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        sorted.sort((a, b) => b.drop - a.drop);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        sorted.reverse();
        break;
      default:
        break;
    }

    if (selectedBrands.length > 0) {
      sorted = sorted.filter((p) => selectedBrands.includes(p.brand));
    }
    sorted = sorted.filter((p) => p.price >= priceMin && p.price <= priceMax);
    if (selectedDiscount !== null) {
      sorted = sorted.filter((p) => p.drop >= selectedDiscount);
    }
    if (selectedAvailability.length > 0) {
      sorted = sorted.filter((p) => selectedAvailability.includes(p.stock));
    }

    return sorted;
  }, [sortBy, selectedBrands, priceMin, priceMax, selectedDiscount, selectedAvailability]);

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-purple-mid transition-colors">Home</Link>
        <ChevronRight size={14} />
        {parentName && parentSlug ? (
          <>
            <Link href={`/category/${parentSlug}`} className="hover:text-purple-mid transition-colors">{parentName}</Link>
            <ChevronRight size={14} />
          </>
        ) : null}
        <span className="text-text-primary font-medium">{categoryName}</span>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">{categoryName}</h1>
        <p className="text-text-secondary text-base">
          {isParent
            ? `Browse all products in ${categoryName}`
            : `Showing results for ${categoryName}`}
        </p>
      </div>

      {/* Subcategory chips (if parent) */}
      {isParent && subcategories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/category/${sub.slug}`}
              className="px-4 py-2 bg-white rounded-full text-sm font-medium text-text-secondary border border-gray-200 hover:border-purple-mid hover:text-purple-mid hover:bg-purple-soft/30 transition-all"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white z-50 md:hidden overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <span className="text-base font-bold text-text-primary">Filter By</span>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button onClick={resetAll} className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                      Reset
                    </button>
                  )}
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="px-4 pb-8">
                <FilterContent
                  openFilter={openFilter}
                  toggleFilter={toggleFilter}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  setPriceMin={setPriceMin}
                  setPriceMax={setPriceMax}
                  allBrands={allBrands}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  connectivityOptions={connectivityOptions}
                  selectedConnectivity={selectedConnectivity}
                  setSelectedConnectivity={setSelectedConnectivity}
                  selectedDiscount={selectedDiscount}
                  setSelectedDiscount={setSelectedDiscount}
                  conditionOptions={conditionOptions}
                  selectedCondition={selectedCondition}
                  setSelectedCondition={setSelectedCondition}
                  availabilityOptions={availabilityOptions}
                  selectedAvailability={selectedAvailability}
                  setSelectedAvailability={setSelectedAvailability}
                  toggleItem={toggleItem}
                />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-purple-dark text-white text-sm font-semibold py-3 rounded-lg hover:bg-purple-mid transition-colors"
                >
                  Show {sortedProducts.length} Products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex gap-6">
        {/* Sidebar filters — desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-base font-bold text-text-primary">Filter By</span>
              {hasActiveFilters && (
                <button onClick={resetAll} className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                  Reset
                </button>
              )}
            </div>
            <div className="px-4">
              <FilterContent
                openFilter={openFilter}
                toggleFilter={toggleFilter}
                priceMin={priceMin}
                priceMax={priceMax}
                setPriceMin={setPriceMin}
                setPriceMax={setPriceMax}
                allBrands={allBrands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                connectivityOptions={connectivityOptions}
                selectedConnectivity={selectedConnectivity}
                setSelectedConnectivity={setSelectedConnectivity}
                selectedDiscount={selectedDiscount}
                setSelectedDiscount={setSelectedDiscount}
                conditionOptions={conditionOptions}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                availabilityOptions={availabilityOptions}
                selectedAvailability={selectedAvailability}
                setSelectedAvailability={setSelectedAvailability}
                toggleItem={toggleItem}
              />
            </div>
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-2 bg-white border border-gray-200 text-sm font-medium text-text-primary px-3 py-2 rounded-lg hover:border-purple-mid transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && <span className="w-2 h-2 bg-purple-mid rounded-full" />}
              </button>
              <span className="text-sm text-text-muted">
                Showing <span className="font-semibold text-text-primary">{sortedProducts.length}</span> products
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 text-sm text-text-primary font-medium px-3 py-2 rounded-lg outline-none cursor-pointer hover:border-purple-mid focus:border-purple-mid transition-colors"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setGridView("grid")}
                  className={`p-1.5 rounded-md transition-colors ${gridView === "grid" ? "bg-white shadow-sm text-purple-dark" : "text-text-muted"}`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setGridView("list")}
                  className={`p-1.5 rounded-md transition-colors ${gridView === "list" ? "bg-white shadow-sm text-purple-dark" : "text-text-muted"}`}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg mb-4">No products found matching your filters.</p>
              <button onClick={resetAll} className="text-sm text-purple-mid font-semibold underline underline-offset-2">
                Clear all filters
              </button>
            </div>
          ) : gridView === "grid" ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5" style={{ overflow: "visible" }}>
              {sortedProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  whileHover={{ y: -8, rotateX: 2, rotateY: -1 }}
                  style={{ transformPerspective: 800 }}
                  className="bg-card-white rounded-xl overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(45,24,84,0.15)] transition-all duration-300"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-36 sm:h-44 lg:h-56 bg-offwhite overflow-hidden">
                      {product.badge && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-purple-soft text-purple-mid text-[9px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">
                          {product.badge}
                        </span>
                      )}
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full z-10">
                        Save Tk {(product.originalPrice - product.price).toFixed(0)}
                      </span>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-2.5 sm:p-4">
                      <p className="text-[10px] sm:text-[11px] text-purple-mid font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{product.brand}</p>
                      <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-2 sm:mb-3 leading-snug line-clamp-2 group-hover:text-purple-dark transition-colors">
                        {product.name}
                      </h3>
                      {product.stock === "In Stock" ? (
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-2 sm:mb-3">
                          <span className="text-sm sm:text-lg font-bold text-orange-600">Tk {product.price.toFixed(2)}</span>
                          <span className="text-[10px] sm:text-xs text-text-muted line-through">Tk {product.originalPrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className={`inline-block text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3 ${
                          product.stock === "Out of Stock"
                            ? "bg-red-100 text-red-600"
                            : product.stock === "Pre-Order"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-amber-100 text-amber-600"
                        }`}>
                          {product.stock}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {product.stock === "In Stock" ? (
                        <button className="flex-1 bg-purple-dark hover:bg-purple-mid text-white text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md transition-colors">
                          Add to Cart
                        </button>
                      ) : product.stock === "Pre-Order" ? (
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md transition-colors">
                          Pre-Order
                        </button>
                      ) : (
                        <button className="flex-1 bg-gray-300 text-gray-500 text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md cursor-not-allowed" disabled>
                          {product.stock}
                        </button>
                      )}
                      <Link
                        href={`/product/${product.id}`}
                        className="text-[10px] sm:text-xs text-text-secondary hover:text-purple-mid transition-colors underline underline-offset-2"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="bg-white rounded-xl overflow-hidden flex group hover:shadow-md transition-all duration-300">
                      <div className="relative w-28 sm:w-48 h-32 sm:h-44 bg-offwhite flex-shrink-0 overflow-hidden">
                        {product.badge && (
                          <span className="absolute top-3 left-3 bg-purple-soft text-purple-mid text-[10px] font-semibold px-3 py-1 rounded-full z-10">
                            {product.badge}
                          </span>
                        )}
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="200px"
                        />
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-center">
                        <p className="text-[11px] text-purple-mid font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
                        <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-purple-dark transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={13} className={s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                          ))}
                        </div>
                        {product.stock === "In Stock" ? (
                          <div className="flex items-baseline gap-3">
                            <span className="text-xl font-bold text-orange-600">Tk {product.price.toFixed(2)}</span>
                            <span className="text-sm text-text-muted line-through">Tk {product.originalPrice.toFixed(2)}</span>
                            <span className="text-xs text-green-600 font-semibold">Save Tk {(product.originalPrice - product.price).toFixed(0)}</span>
                            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{product.drop}%</span>
                          </div>
                        ) : (
                          <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${
                            product.stock === "Out of Stock"
                              ? "bg-red-100 text-red-600"
                              : product.stock === "Pre-Order"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-amber-100 text-amber-600"
                          }`}>
                            {product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
