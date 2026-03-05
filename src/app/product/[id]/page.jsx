import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let product = null;
  let relatedProducts = [];

  try {
    const res = await fetch(`${baseUrl}/api/product?id=${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error(`Failed to fetch product: ${res.status}`);
    }

    const data = await res.json();
    product = data.product;

    if (!product) return notFound();

    // Fetch related products from same category
    try {
      const catRes = await fetch(
        `${baseUrl}/api/product?category=${encodeURIComponent(product.category || "")}&limit=5`,
        { cache: "no-store" }
      );
      if (catRes.ok) {
        const catData = await catRes.json();
        relatedProducts = (catData.products || [])
          .filter((p) => String(p._id) !== id)
          .slice(0, 4);
      }
    } catch (e) {
      console.error("Failed to fetch related products", e);
    }
  } catch (error) {
    console.error("Product fetch error:", error);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
      <Footer />
    </div>
  );
}

