"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "../data/products";

export default function Products() {
    return (
        <section className="bg-cream/50">
            <div className="max-w-7xl mx-auto px-6 py-16">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="bg-card-white rounded-xl overflow-hidden group hover:shadow-md transition-shadow duration-300"
                        >
                            <Link href={`/product/${product.id}`}>
                                {/* Image */}
                                <div className="relative h-56 bg-offwhite overflow-hidden">
                                    {product.badge && (
                                        <span className="absolute top-3 left-3 bg-purple-soft text-purple-mid text-[10px] font-semibold px-3 py-1 rounded-full z-10">
                                            {product.badge}
                                        </span>
                                    )}
                                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
                                        -{product.drop}%
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
                                <div className="p-4">
                                    <p className="text-[11px] text-purple-mid font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
                                    <h3 className="text-sm font-semibold text-text-primary mb-3 leading-snug line-clamp-2 group-hover:text-purple-dark transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-lg font-bold text-orange-600">
                                            Tk {product.price.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-text-muted line-through">
                                            Tk {product.originalPrice.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-green-600 font-semibold">
                                            Save Tk {(product.originalPrice - product.price).toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                            <div className="px-4 pb-4">
                                <div className="flex items-center gap-2">
                                    <button className="flex-1 bg-purple-dark hover:bg-purple-mid text-white text-xs font-semibold py-2.5 rounded-md transition-colors">
                                        Add to Cart
                                    </button>
                                    <Link
                                        href={`/product/${product.id}`}
                                        className="text-xs text-text-secondary hover:text-purple-mid transition-colors underline underline-offset-2"
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
