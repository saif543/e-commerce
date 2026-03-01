"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-2">My Wishlist</h1>
        <p className="text-text-secondary text-sm">
          {wishlistProducts.length > 0
            ? `${wishlistProducts.length} item${wishlistProducts.length !== 1 ? "s" : ""} saved`
            : "Your wishlist is empty"}
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Heart size={32} className="text-text-muted" />
          </div>
          <p className="text-text-secondary mb-6">
            You haven't added anything to your wishlist yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-purple-dark hover:bg-purple-mid text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <ShoppingCart size={15} />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          <AnimatePresence>
            {wishlistProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
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
                    <p className="text-[10px] sm:text-[11px] text-purple-mid font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">
                      {product.brand}
                    </p>
                    <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-2 sm:mb-3 leading-snug line-clamp-2 group-hover:text-purple-dark transition-colors">
                      {product.name}
                    </h3>
                    {product.stock === "In Stock" ? (
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                        <span className="text-sm sm:text-lg font-bold text-orange-600">
                          Tk {product.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-text-muted line-through">
                          Tk {product.originalPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-100 text-red-600">
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
                      className="p-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
