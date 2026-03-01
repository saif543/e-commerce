"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";

const categories = [
  { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop" },
  { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop" },
  { name: "Smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop" },
  { name: "Gaming", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop" },
  { name: "Watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop" },
  { name: "Cameras", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop" },
  { name: "Speakers", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop" },
  { name: "Keyboards", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&h=200&fit=crop" },
  { name: "TVs", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop" },
  { name: "Chargers", image: "https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=200&h=200&fit=crop" },
  { name: "Tablets", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=200&h=200&fit=crop" },
  { name: "Drones", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200&h=200&fit=crop" },
  { name: "Printers", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&h=200&fit=crop" },
  { name: "Storage", image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=200&h=200&fit=crop" },
  { name: "Networking", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop" },
];

export default function Categories() {
  const containerRef = useRef(null);

  return (
    <section className="pb-16 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10 px-6">
        <h2 className="font-serif text-2xl md:text-3xl text-text-primary mb-2">Browse by Category</h2>
        <p className="text-text-secondary text-sm">Find what you need, fast</p>
      </div>

      {/* Draggable Track */}
      <div ref={containerRef} className="overflow-hidden px-6 py-4">
        <motion.div
          className="flex gap-10 cursor-grab active:cursor-grabbing select-none w-max"
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0.1}
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center gap-4 flex-shrink-0"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white shadow-md border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:scale-110 transition-all duration-300">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full rounded-full pointer-events-none"
                  draggable={false}
                />
              </div>
              <span className="text-sm font-medium text-text-primary text-center whitespace-nowrap">
                {cat.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
