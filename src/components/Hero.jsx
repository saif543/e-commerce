"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fallback slide — mirrors exact look from the screenshot
const FALLBACK_SLIDES = [
  {
    badge: "Premium Electronics Store",
    badgeColor: "#ffffff",
    title: "Premium Tech\nfor Modern Living",
    titleColor: "#ffffff",
    titleSize: 52,
    desc: "Thoughtfully curated electronics and gadgets, designed for quality and everyday use.",
    descColor: "rgba(255,255,255,0.85)",
    descSize: 16,
    cta: "Shop Collection",
    ctaBg: "#1a1a1a",
    ctaColor: "#ffffff",
    ctaSize: 14,
    secondCta: "Learn More",
    secondCtaBg: "rgba(255,255,255,0.15)",
    secondCtaColor: "#ffffff",
    link: null,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&h=700&fit=crop",
    alt: "Premium Headphones",
    alignment: "left",
    overlayOpacity: 0.65,
  },
];

const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  // Handle 8-char hex (has built-in opacity — ignore and use alpha param)
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

function mapApiSlide(s) {
  const imageUrl = s.image?.url || s.image || '';
  const opacity = typeof s.overlayOpacity === 'number' ? s.overlayOpacity : 0.65;

  return {
    badge: s.subtitle && s.subtitle !== '--' ? s.subtitle : '',
    badgeColor: s.subtitleColor || '#ffffff',
    title: s.title && s.title !== '--' ? s.title : '',
    titleColor: s.titleColor || '#ffffff',
    titleSize: s.titleSize || 52,
    desc: s.description || '',
    descColor: s.descriptionColor || 'rgba(255,255,255,0.85)',
    descSize: s.descriptionSize || 16,
    cta: s.buttonText || '',
    ctaBg: s.buttonBgColor || '#1a1a1a',
    ctaColor: s.buttonTextColor || '#ffffff',
    ctaSize: s.buttonSize || 14,
    secondCta: s.secondButtonText || 'Learn More',
    secondCtaBg: s.secondButtonBgColor || 'rgba(255,255,255,0.15)',
    secondCtaColor: s.secondButtonTextColor || '#ffffff',
    link: s.link || null,
    secondLink: s.secondLink || null,
    image: imageUrl,
    alt: s.alt || s.title || 'Slide',
    alignment: s.alignment || 'left',
    overlayOpacity: opacity,
  };
}

export default function Hero() {
  const [[current, direction], setSlide] = useState([0, 1]);
  const timerRef = useRef(null);
  const [slides, setSlides] = useState(FALLBACK_SLIDES);

  // Fetch slides from admin API
  useEffect(() => {
    fetch("/api/slider")
      .then((res) => res.json())
      .then((data) => {
        const active = (data.slides || data.sliders || []).filter((s) => s.isActive);
        if (active.length > 0) {
          setSlides(active.map(mapApiSlide));
          setSlide([0, 1]);
        }
      })
      .catch(() => {
        // Keep fallback slides on error
      });
  }, []);

  const goTo = useCallback(
    (index, dir) => {
      setSlide(([prev]) => {
        const d = dir ?? (index > prev ? 1 : -1);
        return [((index % slides.length) + slides.length) % slides.length, d];
      });
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Auto-advance timer — resets on any slide change
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlide(([c]) => [(c + 1) % slides.length, 1]);
    }, 5000);
  }, [slides.length]);

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

  const alignClass =
    slide.alignment === "right"
      ? "items-end text-right"
      : slide.alignment === "center"
        ? "items-center text-center"
        : "items-start text-left";

  // Build dynamic gradient from overlayOpacity
  const opacity = slide.overlayOpacity ?? 0.65;
  const overlayStyle = {
    background: `linear-gradient(to right, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity * 0.55}) 55%, rgba(0,0,0,0) 100%)`,
  };

  return (
    <section className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px] overflow-hidden cursor-grab active:cursor-grabbing select-none">
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
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover pointer-events-none"
              sizes="100vw"
              priority
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800" />
          )}

          {/* Dynamic Gradient Overlay */}
          <div className="absolute inset-0" style={overlayStyle} />
        </motion.div>
      </AnimatePresence>

      {/* Content — slides with image */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-5 md:px-12 flex items-center pointer-events-none">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={`max-w-xl pointer-events-auto flex flex-col ${alignClass}`}
          >
            {/* Badge / Subtitle */}
            {slide.badge && (
              <span
                className="inline-block bg-white/20 backdrop-blur-sm text-[10px] md:text-xs font-semibold px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-3 md:mb-5 tracking-wide border border-white/15"
                style={{ color: slide.badgeColor }}
              >
                {slide.badge}
              </span>
            )}

            {/* Title */}
            {slide.title && (
              <h1
                className="font-serif leading-[1.08] mb-2 md:mb-4 whitespace-pre-line"
                style={{
                  fontSize: `clamp(20px, 5vw, ${slide.titleSize}px)`,
                  color: slide.titleColor,
                  textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 0px 40px rgba(0,0,0,0.4)",
                }}
              >
                {slide.title}
              </h1>
            )}

            {/* Description */}
            {slide.desc && (
              <p
                className="leading-relaxed mb-4 md:mb-7 max-w-md hidden sm:block"
                style={{
                  fontSize: `clamp(13px, 2vw, ${slide.descSize}px)`,
                  color: slide.descColor,
                  textShadow: "0 1px 8px rgba(0,0,0,0.6), 0 0px 30px rgba(0,0,0,0.3)",
                }}
              >
                {slide.desc}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              {slide.cta && (
                slide.link ? (
                  <a href={slide.link} target="_blank" rel="noopener noreferrer">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="px-5 md:px-8 py-2.5 md:py-3.5 rounded-md font-semibold transition-colors shadow-lg text-sm md:text-base"
                      style={{
                        fontSize: undefined,
                        backgroundColor: slide.ctaBg,
                        color: slide.ctaColor,
                      }}
                    >
                      {slide.cta}
                    </motion.button>
                  </a>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-5 md:px-8 py-2.5 md:py-3.5 rounded-md font-semibold transition-colors shadow-lg text-sm md:text-base"
                    style={{
                      fontSize: undefined,
                      backgroundColor: slide.ctaBg,
                      color: slide.ctaColor,
                    }}
                  >
                    {slide.cta}
                  </motion.button>
                )
              )}

              {slide.secondCta && (
                slide.secondLink ? (
                  <a href={slide.secondLink} target="_blank" rel="noopener noreferrer">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="px-4 md:px-6 py-2.5 md:py-3.5 rounded-md text-xs md:text-sm font-medium transition-colors border border-white/20 backdrop-blur-sm"
                      style={{
                        backgroundColor: slide.secondCtaBg,
                        color: slide.secondCtaColor,
                      }}
                    >
                      {slide.secondCta}
                    </motion.button>
                  </a>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 md:px-6 py-2.5 md:py-3.5 rounded-md text-xs md:text-sm font-medium transition-colors border border-white/20 backdrop-blur-sm"
                    style={{
                      backgroundColor: slide.secondCtaBg,
                      color: slide.secondCtaColor,
                    }}
                  >
                    {slide.secondCta}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Left / Right Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
      </button>

      {/* Bottom Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current
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
