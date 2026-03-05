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
      <Products />
      <Products
        title="New Arrivals"
        subtitle="Fresh drops just for you"
        apiUrl="/api/product?limit=10"
        bg="bg-offwhite"
      />
      <TrustBadges />
      <Footer />
    </div>
  );
}
