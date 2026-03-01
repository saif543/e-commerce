import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandsGrid from "@/components/BrandsGrid";

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-offwhite">
      <Navbar />
      <BrandsGrid />
      <Footer />
    </main>
  );
}
