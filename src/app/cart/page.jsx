import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartPage from "@/components/CartPage";

export default function Cart() {
  return (
    <main className="min-h-screen bg-offwhite">
      <Navbar />
      <CartPage />
      <Footer />
    </main>
  );
}
