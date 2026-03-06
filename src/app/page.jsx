import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <Hero />
      <Categories />
      <Products
        title="Most Loved Products"
        subtitle="Discover our top picks for a premium lifestyle"
        apiUrl="/api/product?isLovedProduct=true&limit=10"
        bg="bg-white"
      />
      <Products
        title="New Arrivals"
        subtitle="Fresh drops just for you"
        apiUrl="/api/product?isNewArrival=true&limit=10"
        bg="bg-offwhite"
      />
      <TrustBadges />
      <Footer />
    </div>
  );
}
