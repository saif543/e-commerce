"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";

/*
  Responsive breakpoints:
  xs   0–479    → 2 cols
  sm   480–639  → 2 cols (bigger text/padding)
  md   640–767  → 3 cols
  lg   768–1023 → 3 cols (bigger text/padding)
  xl   1024–1279 → 4 cols
  2xl  1280+    → 5 cols
*/

export default function Products({ title = "Most Loved Products", subtitle = "Discover our top picks for a premium lifestyle", apiUrl = "/api/product?limit=12", bg = "bg-cream/50" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  return (
    <section className={bg}>
      <div className="max-w-[1440px] mx-auto px-2 min-[480px]:px-4 min-[640px]:px-5 min-[768px]:px-6 py-8 min-[768px]:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 min-[768px]:mb-12"
        >
          <h2 className="font-serif text-2xl min-[480px]:text-3xl md:text-4xl text-text-primary mb-2 min-[480px]:mb-3">{title}</h2>
          <p className="text-text-secondary text-xs min-[480px]:text-sm">{subtitle}</p>
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-purple-mid" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">No products available yet.</div>
        ) : (
          <div className="grid grid-cols-2 min-[640px]:grid-cols-3 min-[1024px]:grid-cols-4 min-[1280px]:grid-cols-5 gap-2 min-[480px]:gap-3 min-[640px]:gap-4 min-[768px]:gap-5">
            {products.map((product, i) => (
              <ProductCard key={String(product._id || product.id)} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
