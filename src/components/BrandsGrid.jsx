"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { brands } from "@/data/brands";

export default function BrandsGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary mb-3">Our Brands</h1>
        <p className="text-text-secondary text-base">Explore products from the world's leading electronics brands</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {brands.map((brand, i) => (
          <Link key={brand.name} href={`/brand/${brand.slug}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl hover:border-purple-soft transition-all duration-300 group"
            >
              <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium text-text-muted">
                {brand.products} Products
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
