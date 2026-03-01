import { products } from "@/data/products";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";

export function generateStaticParams() {
    return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const product = products.find((p) => p.id === id);

    if (!product) notFound();

    return (
        <div className="min-h-screen bg-offwhite">
            <Navbar />
            <ProductDetail product={product} />
            <Footer />
        </div>
    );
}
