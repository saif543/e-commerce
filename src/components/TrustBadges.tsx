"use client";

import { motion } from "framer-motion";
import { Truck, Award, RefreshCw } from "lucide-react";

const badges = [
  {
    icon: <Truck size={36} strokeWidth={1.5} />,
    title: "Free Shipping",
    desc: "On all orders over $99",
  },
  {
    icon: <Award size={36} strokeWidth={1.5} />,
    title: "Quality Guaranteed",
    desc: "100% Authentic Products",
  },
  {
    icon: <RefreshCw size={36} strokeWidth={1.5} />,
    title: "30-Day Return",
    desc: "Money Back Guarantee",
  },
];

export default function TrustBadges() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10 px-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-8 md:gap-0">
        {badges.map((badge, i) => (
          <>
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-purple-mid mb-4">{badge.icon}</div>
              <h3 className="font-bold text-text-primary text-base mb-1.5">{badge.title}</h3>
              <p className="text-text-secondary text-sm">{badge.desc}</p>
            </motion.div>

            {i < badges.length - 1 && (
              <div key={`divider-${i}`} className="hidden md:block w-px h-16 bg-gray-200 mx-auto" />
            )}
          </>
        ))}
      </div>
    </section>
  );
}
