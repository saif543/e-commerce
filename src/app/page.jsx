import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";

import Products from "@/components/Products";
import FeaturedCategories from "@/components/FeaturedCategories";
import ExclusiveOffer from "@/components/ExclusiveOffer";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <Hero />

      <Products />
      <FeaturedCategories />
      <ExclusiveOffer />
      <TrustBadges />
      <Footer />
    </div>
  );
}
