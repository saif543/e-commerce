"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "@/data/products";

export default function Products() {
  return (
    <section className="bg-cream/50">
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-3">Most Loved Products</h2>
          <p className="text-text-secondary text-sm">Discover our top picks for a premium lifestyle</p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -8, rotateX: 2, rotateY: -1 }}
              style={{ transformPerspective: 800 }}
              className="bg-card-white rounded-xl overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(45,24,84,0.15)] transition-all duration-300"
            >
              <Link href={`/product/${product.id}`}>
                {/* Image */}
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

                {/* Info */}
                <div className="p-2.5 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] text-purple-mid font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{product.brand}</p>
                  <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-2 sm:mb-3 leading-snug line-clamp-2 group-hover:text-purple-dark transition-colors">
                    {product.name}
                  </h3>
                  {product.stock === "In Stock" ? (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-2 sm:mb-3">
                      <span className="text-sm sm:text-lg font-bold text-orange-600">
                        Tk {product.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-text-muted line-through">
                        Tk {product.originalPrice.toFixed(2)}
                      </span>
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
      </div>
    </section>
  );
}
