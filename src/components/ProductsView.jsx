"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Grid3X3, LayoutList, Star, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

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
    maxPriceLimit,
}) {
    return (
        <>
            <FilterSection title="Price" isOpen={openFilter === "price"} onToggle={() => toggleFilter("price")}>
                <div className="text-center text-sm font-medium text-text-primary mb-3">
                    ৳{priceMin.toLocaleString()} – ৳{priceMax.toLocaleString()}
                </div>
                <input type="range" min={0} max={maxPriceLimit} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-purple-mid mb-3" />
                <div className="flex items-center gap-3">
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(Math.max(0, Number(e.target.value)))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center outline-none focus:border-purple-mid transition-colors" placeholder="Min" />
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(Math.min(maxPriceLimit, Number(e.target.value)))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center outline-none focus:border-purple-mid transition-colors" placeholder="Max" />
                </div>
            </FilterSection>

            <FilterSection title="Brands" isOpen={openFilter === "brands"} onToggle={() => toggleFilter("brands")}>
                <div className="space-y-2.5 max-h-52 overflow-y-auto">
                    {allBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                            <div
                                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedBrands.includes(brand) ? "bg-purple-mid border-purple-mid" : "border-gray-300 group-hover:border-purple-light"
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

            <FilterSection title="Discount" isOpen={openFilter === "discount"} onToggle={() => toggleFilter("discount")}>
                <div className="space-y-2">
                    {[40, 30, 20, 10].map((d) => (
                        <button
                            key={d}
                            onClick={() => setSelectedDiscount(selectedDiscount === d ? null : d)}
                            className={`flex items-center gap-2 w-full py-1.5 px-2 rounded-lg text-sm transition-colors ${selectedDiscount === d ? "bg-purple-soft text-purple-dark font-medium" : "text-text-secondary hover:bg-gray-50"
                                }`}
                        >
                            {d}% or more
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Availability" isOpen={openFilter === "availability"} onToggle={() => toggleFilter("availability")}>
                <div className="space-y-2.5">
                    {availabilityOptions.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <div
                                className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedAvailability.includes(opt) ? "bg-purple-mid border-purple-mid" : "border-gray-300 group-hover:border-purple-light"
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

export default function ProductsView() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");

    const pageTitle = subcategoryParam || categoryParam || "All Products";
    const pageDescription = subcategoryParam
        ? `Showing results for ${subcategoryParam}`
        : categoryParam
            ? `Browse all products in ${categoryParam}`
            : "Browse our complete collection of premium products";

    const [sortBy, setSortBy] = useState("default");
    const [gridView, setGridView] = useState("grid");
    const [openFilter, setOpenFilter] = useState("price");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(9999999);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedConnectivity, setSelectedConnectivity] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedCondition, setSelectedCondition] = useState([]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();

    useEffect(() => {
        setLoading(true);
        let queryArgs = [];
        if (categoryParam) queryArgs.push(`category=${encodeURIComponent(categoryParam)}`);
        if (subcategoryParam) queryArgs.push(`subcategory=${encodeURIComponent(subcategoryParam)}`);
        queryArgs.push("limit=100");

        fetch(`/api/product?${queryArgs.join("&")}`)
            .then((r) => r.ok ? r.json() : Promise.reject(r.status))
            .then((data) => {
                const prods = data.products || [];
                setProducts(prods);
                if (prods.length > 0) {
                    const prices = prods.map((p) => p.price || 0);
                    setPriceMax(Math.max(...prices));
                }
            })
            .catch((err) => console.error("Failed to fetch products:", err))
            .finally(() => setLoading(false));
    }, [categoryParam, subcategoryParam]);

    const toggleFilter = (key) => {
        setOpenFilter((prev) => (prev === key ? null : key));
    };

    const allBrands = useMemo(() => {
        const brands = products
            .map((p) => p.customFields?.brand || p.brand || p.category || "")
            .filter(Boolean);
        return [...new Set(brands)];
    }, [products]);

    const maxPriceLimit = useMemo(() => {
        if (products.length === 0) return 9999999;
        return Math.max(...products.map(p => p.price || 0));
    }, [products]);

    const connectivityOptions = ["Wireless", "Bluetooth", "USB-C", "Wi-Fi", "NFC", "3.5mm Jack"];
    const conditionOptions = ["Brand New", "Refurbished", "Open Box"];
    const availabilityOptions = ["In Stock", "Out of Stock"];

    const hasActiveFilters =
        selectedBrands.length > 0 ||
        selectedConnectivity.length > 0 ||
        selectedDiscount !== null ||
        selectedAvailability.length > 0 ||
        selectedCondition.length > 0 ||
        (products.length > 0 && (priceMax < maxPriceLimit || priceMin > 0));

    const resetAll = () => {
        setPriceMin(0);
        setPriceMax(maxPriceLimit);
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
        let sorted = products.map((p) => {
            const regularPrice = p.price || 0;
            const salePrice = (p.discount && p.discount > 0 && p.discount < regularPrice) ? p.discount : regularPrice;
            const savedAmount = regularPrice - salePrice;
            const discountPct = regularPrice > 0 ? Math.round((savedAmount / regularPrice) * 100) : 0;
            const brandName = p.customFields?.brand || p.brand || p.category || "";
            const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : p.image || "/placeholder.png";
            const isInStock = p.stock === "in_stock" || p.stock === "In Stock";
            return { ...p, _normalPrice: salePrice, _regularPrice: regularPrice, _savedAmount: savedAmount, _discountPct: discountPct, _brand: brandName, _image: imageUrl, _isInStock: isInStock };
        });

        switch (sortBy) {
            case "price-asc": sorted.sort((a, b) => a._normalPrice - b._normalPrice); break;
            case "price-desc": sorted.sort((a, b) => b._normalPrice - a._normalPrice); break;
            case "discount": sorted.sort((a, b) => b._discountPct - a._discountPct); break;
            case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
            case "name-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
            case "newest": sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            default: break;
        }

        if (selectedBrands.length > 0) sorted = sorted.filter((p) => selectedBrands.includes(p._brand));
        sorted = sorted.filter((p) => p._regularPrice >= priceMin && p._regularPrice <= priceMax);
        if (selectedDiscount !== null) sorted = sorted.filter((p) => p._discountPct >= selectedDiscount);
        if (selectedAvailability.length > 0) {
            sorted = sorted.filter((p) => {
                if (selectedAvailability.includes("In Stock") && p._isInStock) return true;
                if (selectedAvailability.includes("Out of Stock") && !p._isInStock) return true;
                return false;
            });
        }

        if (selectedCondition.length > 0) {
            sorted = sorted.filter((p) => selectedCondition.includes(p.condition || p.customFields?.condition));
        }

        return sorted;
    }, [sortBy, selectedBrands, priceMin, priceMax, selectedDiscount, selectedAvailability, selectedCondition, products]);

    return (
        <section className="max-w-[1440px] mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
                <Link href="/" className="hover:text-purple-mid transition-colors">Home</Link>
                <ChevronRight size={14} />
                {categoryParam && subcategoryParam ? (
                    <>
                        <Link href={`/products?category=${encodeURIComponent(categoryParam)}`} className="hover:text-purple-mid transition-colors">{categoryParam}</Link>
                        <ChevronRight size={14} />
                        <span className="text-text-primary font-medium">{subcategoryParam}</span>
                    </>
                ) : (
                    <span className="text-text-primary font-medium">{pageTitle}</span>
                )}
            </div>

            {/* Title */}
            <div className="mb-8">
                <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">{pageTitle}</h1>
                <p className="text-text-secondary text-base">
                    {pageDescription}
                </p>
            </div>

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
                                    maxPriceLimit={maxPriceLimit}
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
                                maxPriceLimit={maxPriceLimit}
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
                                Showing <span className="font-semibold text-text-primary">{loading ? "..." : sortedProducts.length}</span> products
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

                    {/* Products Loading/Empty/List */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="animate-spin text-purple-mid" size={32} />
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="text-center py-20 flex flex-col justify-center items-center">
                            <p className="text-text-muted text-lg mb-4">No products found for this query.</p>
                            {hasActiveFilters && (
                                <button onClick={resetAll} className="text-sm text-white bg-purple-mid hover:bg-purple-dark transition-colors px-6 py-2 rounded-lg font-semibold">
                                    Clear all filters
                                </button>
                            )}
                            {(!hasActiveFilters && (categoryParam || subcategoryParam)) && (
                                <Link href="/products" className="text-sm text-white bg-purple-mid hover:bg-purple-dark transition-colors px-6 py-2 rounded-lg font-semibold mt-4">
                                    View All Products
                                </Link>
                            )}
                        </div>
                    ) : gridView === "grid" ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7" style={{ overflow: "visible" }}>
                            {sortedProducts.map((product, i) => {
                                const productId = String(product._id || product.id);
                                return (
                                    <motion.div
                                        key={productId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.03 }}
                                        whileHover={{ y: -8, rotateX: 2, rotateY: -1 }}
                                        style={{ transformPerspective: 800 }}
                                        className="bg-card-white rounded-xl overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(45,24,84,0.15)] transition-all duration-300 flex flex-col relative"
                                    >
                                        <Link href={`/product/${productId}`} className="flex-1 flex flex-col">
                                            <div className="relative h-36 sm:h-44 lg:h-56 bg-offwhite overflow-hidden">
                                                {product.badge && (
                                                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-purple-soft text-purple-mid text-[9px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">
                                                        {product.badge}
                                                    </span>
                                                )}
                                                {product._savedAmount > 0 && (
                                                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full z-10">
                                                        Save Tk {product._savedAmount.toFixed(0)}
                                                    </span>
                                                )}
                                                <Image
                                                    src={product._image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                            </div>
                                            <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
                                                <p className="text-[10px] sm:text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{product._brand}</p>
                                                <h3 className="text-xs sm:text-sm font-normal text-text-primary/85 mb-2 sm:mb-3 leading-snug line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-auto">
                                                    {product._isInStock ? (
                                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-2 sm:mb-3">
                                                            <span className="text-sm sm:text-lg font-bold text-text-primary">Tk {product._normalPrice.toFixed(2)}</span>
                                                            {product._savedAmount > 0 && (
                                                                <span className="text-[10px] sm:text-xs text-text-muted line-through">Tk {product._regularPrice.toFixed(2)}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3 bg-red-100 text-red-600">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4 mt-auto">
                                            {product._isInStock ? (
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Link href={`/product/${productId}`} className="flex-1 border border-purple-mid text-purple-mid hover:bg-purple-soft text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-center">
                                                        VIEW
                                                    </Link>
                                                    <button onClick={() => addToCart(productId)} className="flex-1 bg-purple-dark hover:scale-[1.03] hover:bg-[#2a2a2a] text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md transition-all duration-200">
                                                        <span className="text-white">ADD TO CART</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="w-full bg-gray-300 text-gray-500 text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md cursor-not-allowed" disabled>
                                                    Out of Stock
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedProducts.map((product, i) => {
                                const productId = String(product._id || product.id);
                                return (
                                    <motion.div
                                        key={productId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.03 }}
                                    >
                                        <Link href={`/product/${productId}`}>
                                            <div className="bg-white rounded-xl overflow-hidden flex group hover:shadow-md transition-all duration-300">
                                                <div className="relative w-28 sm:w-48 h-32 sm:h-44 bg-offwhite flex-shrink-0 overflow-hidden">
                                                    {product.badge && (
                                                        <span className="absolute top-3 left-3 bg-purple-soft text-purple-mid text-[10px] font-semibold px-3 py-1 rounded-full z-10">
                                                            {product.badge}
                                                        </span>
                                                    )}
                                                    <Image
                                                        src={product._image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                                                        sizes="200px"
                                                    />
                                                </div>
                                                <div className="flex-1 p-3 sm:p-5 flex flex-col justify-center">
                                                    <p className="text-[10px] sm:text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{product._brand}</p>
                                                    <h3 className="text-sm sm:text-base font-normal text-text-primary/85 mb-1 sm:mb-2 group-hover:text-purple-dark transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-text-secondary mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
                                                    <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} size={13} className={s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                                                        ))}
                                                    </div>
                                                    {product._isInStock ? (
                                                        <div className="flex items-baseline gap-2 sm:gap-3">
                                                            <span className="text-base sm:text-xl font-bold text-text-primary">Tk {product._normalPrice.toFixed(2)}</span>
                                                            {product._savedAmount > 0 && (
                                                                <>
                                                                    <span className="text-xs sm:text-sm text-text-muted line-through">Tk {product._regularPrice.toFixed(2)}</span>
                                                                    <span className="hidden sm:inline text-xs text-green-600 font-semibold">Save Tk {product._savedAmount.toFixed(0)}</span>
                                                                    <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{product._discountPct}%</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-100 text-red-600">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
