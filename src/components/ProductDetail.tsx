"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Minus, Plus, ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import type { Product } from "@/data/products";

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications">("description");

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 4);

  const allImages = [product.image, ...product.gallery];

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-purple-mid transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Shop
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left — Image Gallery */}
        <div className="lg:w-1/2">
          {/* Main Image */}
          <div className="relative bg-white rounded-2xl overflow-hidden h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing select-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60 && selectedImage < allImages.length - 1) {
                    setSelectedImage((p) => p + 1);
                  } else if (info.offset.x > 60 && selectedImage > 0) {
                    setSelectedImage((p) => p - 1);
                  }
                }}
                className="absolute inset-0 p-6"
              >
                <Image
                  src={allImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain pointer-events-none"
                  sizes="50vw"
                  priority
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {selectedImage > 0 && (
              <button
                onClick={() => setSelectedImage((p) => p - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {selectedImage < allImages.length - 1 && (
              <button
                onClick={() => setSelectedImage((p) => p + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              >
                <ChevronRight size={18} />
              </button>
            )}

            {/* Image counter */}
            <span className="absolute bottom-4 right-4 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              {selectedImage + 1} / {allImages.length}
            </span>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === selectedImage
                    ? "border-purple-mid shadow-md"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        {/* Right — Product Info */}
        <div className="lg:w-1/2">
          {/* Badge */}
          {product.badge && (
            <span className="inline-block bg-purple-soft text-purple-mid text-[11px] font-semibold px-3 py-1 rounded-full mb-4">
              {product.badge}
            </span>
          )}

          {/* Brand */}
          <p className="text-purple-mid text-xs font-semibold uppercase tracking-wider mb-2">{product.brand}</p>

          {/* Name */}
          <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-5 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className={s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-sm text-text-muted">(128 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-orange-600">Tk {product.price.toFixed(2)}</span>
            <span className="text-lg text-text-muted line-through">Tk {product.originalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm text-green-600 font-semibold">
              Save Tk {(product.originalPrice - product.price).toFixed(0)}
            </span>
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              -{product.drop}%
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-8" />

          {/* Description */}
          <p className="text-text-secondary text-base leading-relaxed mb-8">{product.description}</p>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-text-primary mb-4">Key Features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-mid mt-2 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-8" />

          {/* Quantity */}
          <div className="flex items-center gap-5 mb-8">
            <span className="text-sm font-semibold text-text-primary">Quantity</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-purple-mid transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-purple-mid transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-purple-dark hover:bg-purple-mid text-white py-4 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart — Tk {(product.price * qty).toFixed(2)}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 border border-gray-200 rounded-xl flex items-center justify-center text-text-secondary hover:text-red-500 hover:border-red-200 transition-colors"
            >
              <Heart size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Description / Specifications Tabs */}
      <div className="mt-14">
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            {(["description", "specifications"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${
                  activeTab === tab
                    ? "text-purple-dark"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-dark rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-b-xl border border-t-0 border-gray-100"
          >
            {activeTab === "description" ? (
              <div className="p-8">
                <h3 className="text-lg font-bold text-text-primary mb-5">{product.brand} {product.name}</h3>
                <div className="space-y-4">
                  {product.longDescription.map((para, i) => (
                    <p key={i} className="text-text-secondary text-[15px] leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-base font-semibold text-text-primary mb-4">Key Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-mid mt-2 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], i) => (
                      <tr key={key} className={`border-b border-gray-100 last:border-b-0 ${i % 2 === 0 ? "bg-gray-50/70" : "bg-white"}`}>
                        <td className="px-6 py-4 text-sm font-semibold text-text-primary w-2/5 border-r border-gray-100">{key}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products */}
      <div className="mt-10 mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-8">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {relatedProducts.map((rp, i) => (
            <motion.div
              key={rp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden group hover:shadow-md transition-shadow duration-300"
            >
              <Link href={`/product/${rp.id}`}>
                <div className="relative h-48 bg-offwhite overflow-hidden">
                  {rp.badge && (
                    <span className="absolute top-3 left-3 bg-purple-soft text-purple-mid text-[10px] font-semibold px-3 py-1 rounded-full z-10">
                      {rp.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
                    -{rp.drop}%
                  </span>
                  <Image
                    src={rp.image}
                    alt={rp.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-purple-mid font-semibold uppercase tracking-wider mb-1">{rp.brand}</p>
                  <h3 className="text-sm font-semibold text-text-primary mb-2 leading-snug line-clamp-2 group-hover:text-purple-dark transition-colors">
                    {rp.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-orange-600">Tk {rp.price.toFixed(2)}</span>
                    <span className="text-xs text-text-muted line-through">Tk {rp.originalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
