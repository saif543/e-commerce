"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Grid3X3, List, ArrowLeft, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/products";
import { brands } from "@/data/brands";

export default function BrandPage({ slug }) {
  const [viewMode, setViewMode] = useState("grid");
  const { toggleWishlist, isInWishlist } = useWishlist();

  const brand = brands.find((b) => b.slug === slug);
  const brandProducts = products.filter(
    (p) => p.brand.toLowerCase().replace(/\s+/g, "-") === slug
  );

  if (!brand) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-text-primary mb-3">Brand not found</h1>
        <p className="text-text-secondary mb-6">The brand you're looking for doesn't exist.</p>
        <Link href="/brands" className="text-sm font-semibold text-purple-mid hover:text-purple-dark transition-colors underline underline-offset-2">
          Back to all brands
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/brands" className="text-text-muted hover:text-purple-mid transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-2">
            <Image src={brand.logo} alt={brand.name} width={40} height={40} className="object-contain" unoptimized />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-text-primary">{brand.name}</h1>
            <p className="text-sm text-text-secondary">{brand.products} products available</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text-secondary">
          Showing <span className="font-semibold text-text-primary">{brandProducts.length}</span> product{brandProducts.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-100">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-purple-soft text-purple-mid" : "text-text-muted hover:text-text-primary"}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-purple-soft text-purple-mid" : "text-text-muted hover:text-text-primary"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Products */}
      {brandProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary mb-4">No products listed for {brand.name} yet.</p>
          <Link href="/brands" className="text-sm font-semibold text-purple-mid hover:text-purple-dark transition-colors underline underline-offset-2">
            Browse other brands
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7">
          {brandProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative h-36 sm:h-44 lg:h-56 bg-offwhite overflow-hidden">
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-purple-soft text-purple-mid text-[9px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">
                      {product.badge}
                    </span>
                  )}
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <div className="p-2.5 sm:p-4">
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} className={s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                    ))}
                  </div>
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
                    <span className="inline-block text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3 bg-red-100 text-red-600">
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
                  ) : (
                    <button className="flex-1 bg-gray-300 text-gray-500 text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md cursor-not-allowed" disabled>
                      {product.stock}
                    </button>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 rounded-md border border-gray-200 hover:border-purple-mid transition-colors"
                  >
                    <Heart size={14} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-text-muted"} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {brandProducts.map((product, i) => (
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
                  <div className="flex-1 p-3 sm:p-5 flex flex-col justify-center">
                    <p className="text-[10px] sm:text-[11px] text-purple-mid font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{product.brand}</p>
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-1 sm:mb-2 group-hover:text-purple-dark transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary mb-2 sm:mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-0.5 mb-1.5 sm:mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} className={s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                    {product.stock === "In Stock" ? (
                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-base sm:text-xl font-bold text-orange-600">Tk {product.price.toFixed(2)}</span>
                        <span className="text-xs sm:text-sm text-text-muted line-through">Tk {product.originalPrice.toFixed(2)}</span>
                        <span className="hidden sm:inline text-xs text-green-600 font-semibold">Save Tk {(product.originalPrice - product.price).toFixed(0)}</span>
                      </div>
                    ) : (
                      <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-600">
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
  );
}
