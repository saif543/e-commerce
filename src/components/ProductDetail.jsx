"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

function formatPrice(n) {
  return Math.round(n).toLocaleString("en-IN");
}
export default function ProductDetail({ product, relatedProducts = [] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const router = useRouter();

  // Zoom state
  const imageRef = useRef(null);
  const [zoomStyle, setZoomStyle] = useState({ transform: "scale(1)", transformOrigin: "center center" });

  const handleMouseMove = useCallback((e) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transform: "scale(1.5)", transformOrigin: `${x}% ${y}%` });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center center" });
  }, []);

  // Normalize DB fields
  const productId = product._id || product.id;
  const brandName = product.customFields?.brand || product.category || product.brand || "";

  // Price logic
  const regularPrice = product.price || 0;
  const salePrice =
    product.discount && product.discount > 0 && product.discount < regularPrice
      ? product.discount
      : regularPrice;
  const savedAmount = regularPrice - salePrice;
  const discountPct = regularPrice > 0 ? Math.round((savedAmount / regularPrice) * 100) : 0;

  // Build image list
  const allImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url).filter(Boolean)
      : [product.image, ...(product.gallery || [])].filter(Boolean);

  // Description
  const descriptionParagraphs = Array.isArray(product.longDescription)
    ? product.longDescription
    : (product.description || "").split("\n").filter((l) => l.trim());
  const shortDescription = Array.isArray(product.longDescription)
    ? product.description
    : (product.description || "").split("\n")[0] || "";
  const features = product.features || [];
  const specifications = product.specifications || {};
  const customFields = product.customFields
    ? Object.entries(product.customFields).filter(([k]) => k !== "brand")
    : [];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-purple-mid transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Shop
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left — Image Gallery (sticky on desktop) */}
        <div className="lg:w-1/2 lg:sticky lg:top-24 lg:self-start">
          {/* Main Image with hover zoom */}
          <div
            ref={imageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-crosshair group w-full lg:max-w-[80%] mx-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div
                  className="w-full relative"
                  style={{ ...zoomStyle, transition: "transform 0.1s ease-out" }}
                >
                  <img
                    src={allImages[selectedImage] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-auto block pointer-events-none transition-transform duration-300 group-hover:scale-110"
                    draggable={false}
                  />
                </div>
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
            <span className="absolute bottom-4 right-4 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm z-10">
              {selectedImage + 1} / {allImages.length}
            </span>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 overflow-x-auto p-1.5">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${i === selectedImage
                  ? "ring-2 ring-[#C4A265] ring-offset-2 shadow-md opacity-100"
                  : "border-2 border-transparent opacity-50 hover:opacity-100"
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
          <p className="text-text-muted text-[11px] font-semibold uppercase tracking-widest mb-2">
            {brandName || product.brand}
          </p>

          {/* Name */}
          <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price Box */}
          <div className="bg-purple-soft/50 rounded-xl px-5 py-4 mb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-text-primary">Tk {formatPrice(salePrice)}</span>
              {savedAmount > 0 && (
                <span className="text-base text-text-muted line-through">Tk {formatPrice(regularPrice)}</span>
              )}
            </div>
            {savedAmount > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-green-600 font-semibold">
                  Save Tk {formatPrice(savedAmount)}
                </span>
                <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  -{discountPct}%
                </span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-green-600">In Stock</span>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Description */}
          <p className="text-text-secondary text-base leading-relaxed mb-6">
            {shortDescription || product.description}
          </p>

          {/* Features — card grid */}
          {features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-text-primary mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3.5 py-3 text-sm text-text-secondary"
                  >
                    <CheckCircle2 size={16} className="text-purple-mid mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Quantity */}
          <div className="flex items-center gap-5 mb-5">
            <span className="text-sm font-semibold text-text-primary">Quantity</span>
            <div className="flex items-center bg-gray-50 rounded-lg">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-purple-mid transition-colors rounded-l-lg hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center text-sm font-semibold select-none">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-purple-mid transition-colors rounded-r-lg hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(productId, qty)}
              className="w-full bg-black hover:bg-black/85 py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} className="text-[#C4A265]" />
              <span className="bg-gradient-to-r from-[#C4A265] via-[#D4B978] to-[#C4A265] bg-clip-text text-transparent">
                Add to Cart — Tk {formatPrice(salePrice * qty)}
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addToCart(productId, qty);
                router.push(`/cart?checkout=true&buyNowId=${productId}`);
              }}
              className="w-full border-2 border-[#C4A265] text-[#C4A265] hover:bg-white/60 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              Buy Now
            </motion.button>
          </div>
        </div>
      </div>

      {/* Description / Specifications Tabs */}
      <div className="mt-14">
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            {["description", "specifications"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${activeTab === tab
                  ? "text-purple-dark"
                  : "text-text-muted hover:text-text-secondary"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-mid rounded-full"
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
            className="bg-white rounded-b-xl border border-t-0 border-gray-100 shadow-sm"
          >
            {activeTab === "description" ? (
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold text-text-primary mb-5">
                  {brandName || product.brand} {product.name}
                </h3>
                <div className="space-y-4">
                  {descriptionParagraphs.map((para, i) => (
                    <p key={i} className="text-text-secondary text-[15px] leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                {/* Custom Fields */}
                {customFields.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-base font-semibold text-text-primary mb-4">Product Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {customFields.map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                        >
                          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">
                            {key}
                          </p>
                          <p className="text-sm font-normal text-text-primary">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(specifications).map(([key, value], i) => (
                      <tr
                        key={key}
                        className={`border-b border-gray-100 last:border-b-0 ${i % 2 === 0 ? "bg-gray-50/70" : "bg-white"
                          }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-text-primary w-2/5 border-r border-gray-100">
                          {key}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {typeof value === "object" ? JSON.stringify(value) : value}
                        </td>
                      </tr>
                    ))}
                    {Object.keys(specifications).length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-sm text-text-muted text-center">
                          No specifications available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-10 mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((rp, i) => {
              const rpId = String(rp._id || rp.id);
              const rpBrand = rp.customFields?.brand || rp.category || rp.brand || "";
              const rpImage =
                rp.images && rp.images.length > 0
                  ? rp.images[0].url
                  : rp.image || "/placeholder.png";
              // Correct DB schema: price = regular, discount = sale price
              const rpRegular = rp.price || 0;
              const rpSale =
                rp.discount && rp.discount > 0 && rp.discount < rpRegular
                  ? rp.discount
                  : rpRegular;
              const rpSaved = rpRegular - rpSale;

              return (
                <motion.div
                  key={rpId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden group hover:shadow-md transition-shadow duration-300"
                >
                  <Link href={`/product/${rpId}`}>
                    <div className="relative h-36 sm:h-44 lg:h-56 bg-offwhite overflow-hidden">
                      {rp.badge && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-purple-soft text-purple-mid text-[9px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10">
                          {rp.badge}
                        </span>
                      )}
                      {rpSaved > 0 && (
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full z-10">
                          Save Tk {formatPrice(rpSaved)}
                        </span>
                      )}
                      <Image
                        src={rpImage}
                        alt={rp.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-2.5 sm:p-4">
                      <p className="text-[10px] sm:text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">
                        {rpBrand}
                      </p>
                      <h3 className="text-xs sm:text-sm font-normal text-text-primary/85 mb-2 sm:mb-3 leading-snug line-clamp-2 group-hover:text-purple-mid transition-colors">
                        {rp.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                        <span className="text-sm sm:text-lg font-semibold text-text-primary">
                          Tk {formatPrice(rpSale)}
                        </span>
                        {rpSaved > 0 && (
                          <span className="text-[10px] sm:text-xs text-text-muted line-through">
                            Tk {formatPrice(rpRegular)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center gap-3 z-50 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted truncate">{product.name}</p>
          <p className="text-base font-semibold text-text-primary">Tk {formatPrice(salePrice * qty)}</p>
        </div>
        <button
          onClick={() => addToCart(productId, qty)}
          className="bg-purple-dark hover:bg-purple-mid text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-20 lg:hidden" />
    </section>
  );
}
