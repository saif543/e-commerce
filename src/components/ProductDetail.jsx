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
import ProductCard from "./ProductCard";

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
    <section className="bg-white min-h-screen pb-16 font-sans">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        {/* <div className="flex items-center gap-2 text-[11px] font-bold text-gray-800 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-black hover:underline cursor-pointer"><span className="text-gray-900">Home</span></Link>
          <span className="text-gray-400">/</span>
          {product.category && (
            <>
              <span className="text-gray-900">{product.category}</span>
              <span className="text-gray-400">/</span>
            </>
          )}
          {brandName && (
            <>
              <span className="text-gray-900">{brandName}</span>
              <span className="text-gray-400">/</span>
            </>
          )}
          <span className="text-gray-500">{product.name}</span>
        </div> */}

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Left Column - Gallery */}
          <div className="lg:w-[50%] flex flex-col-reverse lg:flex-row gap-4 lg:self-start">
            {/* Thumbnails (Vertical on desktop) */}
            <div className="flex lg:flex-col gap-3 lg:w-[72px] flex-shrink-0 overflow-x-auto lg:overflow-visible p-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-[70px] h-[85px] rounded-md overflow-hidden border p-1 transition-all flex-shrink-0 bg-white ${i === selectedImage ? 'border-[#c4a265] shadow-sm ring-1 ring-[#c4a265]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Image src={img} alt={`Thumb ${i}`} fill className="object-contain p-1" sizes="70px" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div
              className="flex-1 relative rounded-lg border border-gray-100 flex items-center justify-center min-h-[440px] lg:min-h-[530px] cursor-crosshair overflow-hidden group bg-white shadow-sm w-full"
              ref={imageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Badge if exists */}
              {product.badge && (
                <div className="absolute top-4 left-4 bg-purple-soft text-purple-mid text-[11px] font-semibold px-3 py-1 rounded-full z-10 opacity-90">
                  {product.badge}
                </div>
              )}
              {discountPct > 0 && !product.badge && (
                <div className="absolute top-4 left-4 bg-[#d18e54] text-white text-[13px] font-bold px-2 py-0.5 rounded shadow-sm z-10 opacity-90">
                  {discountPct}%
                </div>
              )}

              <div className="absolute inset-0 max-w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <div
                      className="w-full h-full relative"
                      style={{ ...zoomStyle, transition: "transform 0.1s ease-out" }}
                    >
                      <Image
                        src={allImages[selectedImage] || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-cover pointer-events-none"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:w-[50%] flex flex-col pt-1">
            <div className="mb-6 flex items-center">
              {/* <div className="text-[13px] font-bold text-gray-500 tracking-wide flex items-center gap-2">
                Brand : <span className="text-[#0066cc] border border-blue-200/60 bg-blue-50/30 px-2 py-0.5 rounded text-[11px] font-bold">{brandName || "Unknown"}</span>
              </div> */}
            </div>

            {/* Title & Price Box */}
            <div className="bg-[#fcfaf8] rounded-xl px-6 py-6 mb-6 shadow-sm border border-gray-100/50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 border-b border-gray-200 pb-5 gap-4">
                <div className="flex-1 pr-4">
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 mt-1">
                  <div className="text-xl font-medium text-[#c45a27]">Tk {formatPrice(salePrice)}</div>
                  {savedAmount > 0 && (
                    <div className="text-[13px] text-gray-400 line-through mt-0.5 font-medium">Tk {formatPrice(regularPrice)}</div>
                  )}
                </div>
              </div>

              {/* Stock Status indicator */}
              <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-sm font-medium text-green-600 tracking-wide">In Stock</span>
              </div>

              {/* Short Description */}
              <div className="text-[13px] text-gray-600 leading-relaxed mb-4">
                {shortDescription || product.description}
              </div>

              {/* Features list */}
              {features.length > 0 && (
                <div className="flex flex-col gap-2 text-[13px] text-gray-600 mt-4">
                  {features.slice(0, 5).map((feat, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <CheckCircle2 size={16} className="text-[#c4a265] flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add To Cart & Qty Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
              {/* Qty Counter */}
              <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden h-[46px] w-full sm:w-[110px] flex-shrink-0 shadow-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-1/3 sm:w-[38px] h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
                  <Minus size={15} strokeWidth={2.5} />
                </button>
                <span className="w-1/3 sm:flex-1 text-center text-sm font-bold text-gray-800">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-1/3 sm:w-[38px] h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
                  <Plus size={15} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => addToCart(productId, qty)}
                  className="flex-1 bg-[#111111] text-white hover:bg-[#333333] h-[46px] rounded text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <ShoppingCart size={16} /> Add To Cart
                </button>
                <button
                  onClick={() => {
                    addToCart(productId, qty);
                    router.push(`/cart?checkout=true&buyNowId=${productId}`);
                  }}
                  className="flex-1 border-2 border-[#c4a265] text-[#c4a265] hover:bg-white/60 h-[46px] rounded text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Zap size={14} /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs section from 2nd screenshot */}
        <div className="mt-16">
          <div className="flex gap-3 mb-6">
            {["specification", "description"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 text-[13px] font-bold tracking-wide rounded border transition-all capitalize ${activeTab === tab
                  ? "bg-[#fcfaf8] text-gray-800 border-gray-300 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "description" ? (
                  <div className="text-gray-600 text-[14px] leading-relaxed space-y-4 max-w-4xl p-6 bg-[#fcfaf8] rounded-md border border-gray-100">
                    {descriptionParagraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                    {customFields.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {customFields.map(([key, value]) => (
                            <div key={key} className="bg-white rounded px-4 py-3 border border-gray-100 shadow-sm">
                              <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1">{key}</p>
                              <p className="text-sm font-medium text-gray-800">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-w-[100%] xl:max-w-6xl">
                    {/* Specifications Accordion Style */}
                    <div className="flex flex-col text-[13px]">
                      {Object.keys(specifications).length > 0 ? (
                        <>
                          {Object.entries(specifications).map(([key, value], i) => (
                            <div key={key} className={`flex border-b border-white last:mb-2 py-4 px-6 items-center hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "bg-[#f5ebd7]" : "bg-[#fcfaf8]"}`}>
                              <div className="w-1/3 text-[11px] font-bold text-gray-700 tracking-wider uppercase pr-4">{key}</div>
                              <div className="w-2/3 text-[13px] text-gray-600 font-medium border-l border-gray-200/60 pl-6 h-full flex items-center">
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="py-12 bg-[#fcfaf8] rounded text-center text-sm text-gray-500 border border-gray-100">No specifications found.</div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 mb-10">
            <h2 className="text-xl font-bold text-[#111111] tracking-wide mb-8 border-b-2 border-black inline-block pb-2 uppercase">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rp, i) => (
                <ProductCard key={String(rp._id || rp.id)} product={rp} index={i} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex items-center gap-3 z-50 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted truncate">{product.name}</p>
          <p className="text-base font-semibold text-text-primary">Tk {formatPrice(salePrice * qty)}</p>
        </div>
        <button
          onClick={() => addToCart(productId, qty)}
          className="bg-[#111111] hover:bg-[#333333] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
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
