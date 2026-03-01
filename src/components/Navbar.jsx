"use client";

import { motion } from "framer-motion";
import { Search, Heart, ShoppingCart } from "lucide-react";

const navLinks = [
    { label: "HOME", active: true },
    { label: "SHOP" },
    { label: "CATEGORIES" },
    { label: "DEALS" },
    { label: "NEW ARRIVALS" },
    { label: "CONTACT" },
];

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card-white border-b border-gray-100 sticky top-0 z-50"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
                {/* Logo */}
                <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-purple-dark rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">N</span>
                    </div>
                    <span className="font-serif text-xl text-purple-dark tracking-tight">Nishat</span>
                </motion.div>

                {/* Nav Links */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map((link, i) => (
                        <motion.li
                            key={link.label}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 + 0.2 }}
                        >
                            <a
                                href="#"
                                className={`text-[13px] font-medium tracking-wider transition-colors hover:text-purple-mid ${link.active ? "text-purple-mid" : "text-text-primary"
                                    }`}
                            >
                                {link.label}
                            </a>
                        </motion.li>
                    ))}
                </ul>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-sm text-text-secondary hover:text-purple-mid cursor-pointer transition-colors">
                        Login/Register
                    </span>
                    <div className="flex items-center gap-4 ml-3">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-text-primary hover:text-purple-mid transition-colors">
                            <Search size={18} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="text-text-primary hover:text-purple-mid transition-colors">
                            <Heart size={18} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative text-text-primary hover:text-purple-mid transition-colors">
                            <ShoppingCart size={18} />
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
