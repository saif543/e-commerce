"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingCart, ChevronDown, ChevronRight, X } from "lucide-react";
import { categories } from "@/data/categories";
import { useWishlist } from "@/context/WishlistContext";

const navLinks = [
  { label: "BRANDS", href: "/brands" },
  { label: "TRENDING", href: "/trending" },
  { label: "SUPPORT", href: "/support" },
  { label: "ABOUT US", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);
  const { wishlist } = useWishlist();

  const isCategoryActive = pathname.startsWith("/category");

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card-white border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/">
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2.5 cursor-pointer">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${pathname === "/" ? "bg-purple-mid" : "bg-purple-dark"}`}>
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className={`font-serif text-xl tracking-tight transition-colors ${pathname === "/" ? "text-purple-mid" : "text-purple-dark"}`}>Nishat</span>
          </motion.div>
        </Link>

        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-8">
          {/* ALL CATEGORIES with dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => { setShowCategories(false); setActiveCategory(null); }}
          >
            <button className={`flex items-center gap-1.5 text-sm font-semibold tracking-wider transition-colors relative pb-0.5 ${
              isCategoryActive ? "text-purple-mid" : "text-text-primary hover:text-purple-mid"
            }`}>
              ALL CATEGORIES
              <ChevronDown size={14} className={`transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`} />
              {isCategoryActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-mid rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 pt-3 z-50"
                >
                  <div className="flex bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Parent categories */}
                    <div className="w-64 py-2 border-r border-gray-100">
                      {categories.map((cat, i) => (
                        <Link
                          key={cat.name}
                          href={`/category/${cat.slug}`}
                          onMouseEnter={() => setActiveCategory(i)}
                          onClick={() => { setShowCategories(false); setActiveCategory(null); }}
                          className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-colors ${
                            activeCategory === i
                              ? "bg-purple-soft text-purple-dark"
                              : "text-text-primary hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm">{cat.name}</span>
                          <ChevronRight size={14} className="text-text-muted" />
                        </Link>
                      ))}
                    </div>

                    {/* Subcategories */}
                    <AnimatePresence mode="wait">
                      {activeCategory !== null && (
                        <motion.div
                          key={activeCategory}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.15 }}
                          className="w-56 py-2"
                        >
                          <Link
                            href={`/category/${categories[activeCategory].slug}`}
                            onClick={() => { setShowCategories(false); setActiveCategory(null); }}
                            className="block px-5 py-2 text-[11px] font-semibold text-purple-mid uppercase tracking-wider hover:text-purple-dark transition-colors"
                          >
                            View All {categories[activeCategory].name}
                          </Link>
                          {categories[activeCategory].subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/category/${sub.slug}`}
                              onClick={() => { setShowCategories(false); setActiveCategory(null); }}
                              className="block px-5 py-2.5 text-sm text-text-secondary hover:text-purple-dark hover:bg-purple-soft/40 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {/* Other nav links */}
          {navLinks.map((link, i) => {
            const isActive = link.href !== "#" && pathname === link.href;
            return (
              <motion.li
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.3 }}
                className="relative"
              >
                <Link
                  href={link.href}
                  className={`text-sm font-semibold tracking-wider transition-colors pb-0.5 ${
                    isActive ? "text-purple-mid" : "text-text-primary hover:text-purple-mid"
                  }`}
                >
                  {link.label}
                </Link>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-purple-mid rounded-full" />
                )}
              </motion.li>
            );
          })}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline text-sm font-semibold text-text-primary hover:text-purple-mid transition-colors">
            Login/Register
          </Link>
          <div className="flex items-center gap-4 ml-3">
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 pl-3 pr-1 py-1.5">
                      <Search size={14} className="text-text-muted flex-shrink-0" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none ml-2"
                        onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
                      />
                      <button
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!searchOpen && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchOpen(true)}
                  className="text-text-primary hover:text-purple-mid transition-colors"
                >
                  <Search size={22} />
                </motion.button>
              )}
            </div>
            <Link href="/wishlist">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative text-text-primary hover:text-purple-mid transition-colors">
                <Heart size={22} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative text-text-primary hover:text-purple-mid transition-colors">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2.5 bg-purple-mid text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
