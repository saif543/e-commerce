import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import FeaturedCategories from "@/components/FeaturedCategories";
import ExclusiveOffer from "@/components/ExclusiveOffer";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <Hero />
      <TrustBadges />
      <Categories />
      <Products />
      <FeaturedCategories />
      <ExclusiveOffer />
      <Testimonials />
      <Footer />
    </div>
  );
}
