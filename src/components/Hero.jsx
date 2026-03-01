"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    badge: "Premium Electronics Store",
    title: "Premium Tech\nfor Modern Living",
    desc: "Thoughtfully curated electronics and gadgets, designed for quality and everyday use.",
    cta: "Shop Collection",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&h=700&fit=crop",
    alt: "Premium Headphones",
    gradient: "from-black/70 via-black/40 to-transparent",
  },
  {
    badge: "Limited Time — 30% Off",
    title: "Smart Watches\nRedefined",
    desc: "Track your fitness, stay connected, and look great with our latest wearable collection.",
    cta: "Grab the Deal",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&h=700&fit=crop",
    alt: "Smart Watch",
    gradient: "from-black/70 via-black/40 to-transparent",
  },
  {
    badge: "New Arrival",
    title: "Next-Gen Laptops\nAre Here",
    desc: "Powerful performance meets sleek design. Upgrade your workflow today.",
    cta: "Explore Laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&h=700&fit=crop",
    alt: "MacBook Laptop",
    gradient: "from-black/60 via-black/30 to-transparent",
  },
  {
    badge: "Best Seller",
    title: "Immersive Sound\nExperience",
    desc: "Noise cancelling earbuds with studio quality sound. Music the way it was meant to be.",
    cta: "Shop Audio",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=1400&h=700&fit=crop",
    alt: "Wireless Earbuds",
    gradient: "from-black/70 via-black/40 to-transparent",
  },
  {
    badge: "Flash Sale — 40% Off",
    title: "Type Like\nNever Before",
    desc: "Mechanical keyboards built for speed, precision, and satisfaction.",
    cta: "Buy Now",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1400&h=700&fit=crop",
    alt: "Mechanical Keyboard",
    gradient: "from-black/60 via-black/30 to-transparent",
  },
];

const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function Hero() {
  const [[current, direction], setSlide] = useState([0, 1]);
  const timerRef = useRef(null);

  const goTo = useCallback((index, dir) => {
    setSlide(([prev]) => {
      const d = dir ?? (index > prev ? 1 : -1);
      return [((index % slides.length) + slides.length) % slides.length, d];
    });
  }, []);

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Auto-advance timer — resets on any slide change
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(([c]) => [(c + 1) % slides.length, 1]);
    }, 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, resetTimer]);

  // Drag / swipe handler
  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      next();
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      prev();
    }
  };

  const slide = slides[current];

  return (
    <section className="relative w-full h-[420px] md:h-[480px] lg:h-[520px] overflow-hidden cursor-grab active:cursor-grabbing select-none">
      {/* Background Images — slide left/right */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover pointer-events-none"
            sizes="100vw"
            priority
            draggable={false}
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
        </motion.div>
      </AnimatePresence>

      {/* Content — slides with image */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 flex items-center pointer-events-none">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-xl pointer-events-auto"
          >
            {/* Badge */}
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide border border-white/15">
              {slide.badge}
            </span>

            {/* Title — text shadow for readability on any background */}
            <h1
              className="font-serif text-3xl md:text-4xl lg:text-[52px] leading-[1.08] text-white mb-4 whitespace-pre-line"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 0px 40px rgba(0,0,0,0.4)" }}
            >
              {slide.title}
            </h1>

            {/* Desc */}
            <p
              className="text-white text-sm md:text-base leading-relaxed mb-7 max-w-md"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6), 0 0px 30px rgba(0,0,0,0.3)" }}
            >
              {slide.desc}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-purple-dark hover:bg-purple-mid text-white px-8 py-3.5 rounded-md text-sm font-semibold transition-colors shadow-lg"
              >
                {slide.cta}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white px-6 py-3.5 rounded-md text-sm font-medium transition-colors border border-white/20"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Left / Right Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      {/* Bottom Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-10 h-2.5 bg-white"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-purple-light"
        />
      </div>
    </section>
  );
}
