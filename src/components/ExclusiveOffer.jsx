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
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&h=700&fit=crop",
  },
  {
    badge: "Flash Deal",
    badgeIcon: <Zap size={12} />,
    title: "Mechanical Keyboards",
    subtitle: "Premium switches, RGB lighting",
    discount: "40",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1400&h=700&fit=crop",
  },
  {
    badge: "Bundle Offer",
    badgeIcon: <Gift size={12} />,
    title: "Smart Watch Collection",
    subtitle: "Free band with every purchase",
    discount: "30",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&h=700&fit=crop",
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
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-10"
        >
          <h2 className="font-serif text-2xl md:text-4xl text-text-primary mb-2 md:mb-3">Exclusive Offers</h2>
          <p className="text-text-secondary text-xs md:text-sm">Savings on your favorite premium products</p>
        </motion.div>

        {/* ══════ MOBILE (<766px): Image background with text overlay ══════ */}
        <div className="min-[766px]:hidden rounded-2xl relative overflow-hidden">
          {/* Background image — animated */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-img-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={offer.image}
                alt={offer.title}
                fill
                className="object-cover pointer-events-none"
                sizes="100vw"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-end p-5 min-h-[280px]">
            {/* Discount badge — top right */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-disc-${current}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gold-gradient shadow-[0_0_20px_rgba(184,134,11,0.4)] border-2 border-white/25 flex flex-col items-center justify-center"
              >
                <span className="font-serif text-3xl font-bold text-white leading-none drop-shadow-lg">{offer.discount}%</span>
                <span className="text-white/90 text-[9px] font-bold tracking-widest uppercase">OFF</span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-text-${current}`}
                variants={contentFade}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1 rounded-full mb-3 border border-white/15">
                  {offer.badgeIcon}
                  {offer.badge}
                </span>
                <h3 className="font-serif text-2xl text-white mb-1.5 leading-tight">
                  {offer.title}
                </h3>
                <p className="text-white/75 text-sm mb-4">{offer.subtitle}</p>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-white text-text-primary px-5 py-2.5 rounded-md text-xs font-semibold hover:bg-white/90 transition-colors shadow-lg"
                  >
                    Shop Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-md text-xs font-medium hover:bg-white/20 transition-colors border border-white/15"
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ══════ DESKTOP (>=766px): Image background with text overlay ══════ */}
        <div className="hidden min-[766px]:block rounded-2xl relative overflow-hidden">
          {/* Background image — animated */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`desktop-img-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={offer.image}
                alt={offer.title}
                fill
                className="object-cover pointer-events-none"
                sizes="100vw"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />

          {/* Discount badge — top right corner */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`dt-disc-${current}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute top-6 right-6 z-20 w-32 h-32 rounded-full bg-gold-gradient shadow-[0_0_30px_rgba(184,134,11,0.4)] border-2 border-white/25 flex flex-col items-center justify-center"
            >
              <span className="font-serif text-5xl font-bold text-white leading-none drop-shadow-lg">{offer.discount}%</span>
              <span className="text-white/90 text-xs font-bold tracking-widest uppercase">OFF</span>
            </motion.div>
          </AnimatePresence>

          {/* Content overlay */}
          <div className="relative z-10 flex items-end p-10 min-[824px]:p-14 min-h-[340px]">
            <div className="max-w-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`dt-text-${current}`}
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
                  <h3 className="font-serif text-3xl min-[824px]:text-4xl text-white mb-3 leading-tight">
                    {offer.title}
                  </h3>
                  <p className="text-white/75 text-base mb-8">{offer.subtitle}</p>
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
