"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/product?limit=12")
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-purple-mid" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">No products available yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
            {products.map((product, i) => {
              const productId = String(product._id || product.id);
              const brandName = product.customFields?.brand || product.category || product.brand || "";
              const imageUrl =
                product.images && product.images.length > 0
                  ? product.images[0].url
                  : product.image || "/placeholder.png";
              // DB: price = regular/MRP, discount = sale price (what customer pays)
              const regularPrice = product.price || 0;
              const salePrice = (product.discount && product.discount > 0 && product.discount < regularPrice)
                ? product.discount
                : regularPrice;
              const savedAmount = regularPrice - salePrice;
              const isAvailable = product.stock === "In Stock" || product.stock === "in_stock";

              return (
                <motion.div
                  key={productId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -8, rotateX: 2, rotateY: -1 }}
                  style={{ transformPerspective: 800 }}
                  className="bg-card-white rounded-xl overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(45,24,84,0.15)] transition-all duration-300 flex flex-col"
                >
                  <Link href={`/product/${productId}`} className="flex-1 flex flex-col">
                    {/* Image */}
                    <div className="relative h-36 sm:h-44 lg:h-56 bg-offwhite overflow-hidden">
                      {product.badge && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-purple-soft text-purple-mid text-[9px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">
                          {product.badge}
                        </span>
                      )}
                      {savedAmount > 0 && (
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full z-10">
                          Save Tk {savedAmount.toFixed(0)}
                        </span>
                      )}
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
                      <p className="text-[10px] sm:text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{brandName}</p>
                      <h3 className="text-xs sm:text-sm font-normal text-text-primary/85 mb-2 sm:mb-3 leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        {isAvailable ? (
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 mb-2 sm:mb-3">
                            <span className="text-sm sm:text-lg font-bold text-text-primary">
                              Tk {salePrice.toFixed(2)}
                            </span>
                            {savedAmount > 0 && (
                              <span className="text-[10px] sm:text-xs text-text-muted line-through">
                                Tk {regularPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mb-2 sm:mb-3 bg-red-100 text-red-600">
                            {product.stock === "out_of_stock" ? "Out of Stock" : product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-4 mt-auto">
                    {isAvailable ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Link href={`/product/${productId}`} className="flex-1 border border-purple-mid text-purple-mid hover:bg-purple-soft text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-center">
                          VIEW
                        </Link>
                        <button onClick={() => addToCart(productId)} className="flex-1 bg-purple-dark hover:bg-purple-mid text-white text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md transition-colors">
                          ADD TO CART
                        </button>
                      </div>
                    ) : (
                      <button className="w-full bg-gray-300 text-gray-500 text-[10px] sm:text-xs font-semibold py-2 sm:py-2.5 rounded-md cursor-not-allowed" disabled>
                        {product.stock === "out_of_stock" ? "Out of Stock" : product.stock}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

