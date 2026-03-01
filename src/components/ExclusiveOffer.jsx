"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, Gift } from "lucide-react";

const offers = [
  {
    badge: "Limited Time",
    badgeIcon: <Clock size={12} />,
    title: "Premium Headphones",
    subtitle: "Buy 1, Get 1 50% OFF",
    discount: "25",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
  },
  {
    badge: "Flash Deal",
    badgeIcon: <Zap size={12} />,
    title: "Mechanical Keyboards",
    subtitle: "Premium switches, RGB lighting",
    discount: "40",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop",
  },
  {
    badge: "Bundle Offer",
    badgeIcon: <Gift size={12} />,
    title: "Smart Watch Collection",
    subtitle: "Free band with every purchase",
    discount: "30",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
  },
];

const contentFade = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

export default function ExclusiveOffer() {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index) => {
    setCurrent(((index % offers.length) + offers.length) % offers.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % offers.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const offer = offers[current];

  return (
    <section className="bg-cream/50">
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-3">Exclusive Offers</h2>
          <p className="text-text-secondary text-sm">Savings on your favorite premium products</p>
        </motion.div>

        {/* Static Card — content animates inside */}
        <div className="bg-gradient-to-r from-purple-dark to-purple-mid rounded-2xl relative min-h-[320px] md:min-h-[340px] overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-center h-full p-8 md:p-14 gap-8">
            {/* Left Content — animated */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`text-${current}`}
                  variants={contentFade}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/15">
                    {offer.badgeIcon}
                    {offer.badge}
                  </span>
                  <h3 className="font-serif text-3xl md:text-4xl text-white mb-3 leading-tight">
                    {offer.title}
                  </h3>
                  <p className="text-white/70 text-base mb-8">{offer.subtitle}</p>
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="bg-white text-text-primary px-7 py-3 rounded-md text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
                    >
                      Shop Now
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-white/20 transition-colors border border-white/15"
                    >
                      View Details
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Discount Badge — animated */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`disc-${current}`}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="relative w-36 h-36 rounded-full border-2 border-dashed border-white/30 flex flex-col items-center justify-center"
                >
                  <span className="font-serif text-6xl font-bold text-white leading-none">{offer.discount}%</span>
                  <span className="text-white/80 text-sm font-semibold tracking-wider">OFF</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Image — animated */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${current}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative w-56 h-56 md:w-64 md:h-64 flex-shrink-0 rounded-2xl border-2 border-white/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl" />
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="256px"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2.5 mt-6">
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 h-2.5 bg-purple-dark"
                  : "w-2.5 h-2.5 bg-purple-muted hover:bg-purple-mid/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
