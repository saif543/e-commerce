import { use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandPage from "@/components/BrandPage";

export default function Brand({ params }) {
  const { slug } = use(params);
  return (
    <main className="min-h-screen bg-offwhite">
      <Navbar />
      <BrandPage slug={slug} />
      <Footer />
    </main>
  );
}
