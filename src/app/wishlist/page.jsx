import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WishlistPage from "@/components/WishlistPage";

export default function Wishlist() {
  return (
    <main className="min-h-screen bg-offwhite">
      <Navbar />
      <WishlistPage />
      <Footer />
    </main>
  );
}
