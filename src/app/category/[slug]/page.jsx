import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryPage from "@/components/CategoryPage";
import { categories } from "@/data/categories";

export function generateStaticParams() {
  const params = [];
  categories.forEach((cat) => {
    params.push({ slug: cat.slug });
    cat.subcategories.forEach((sub) => {
      params.push({ slug: sub.slug });
    });
  });
  return params;
}

export default async function Page({ params }) {
  const { slug } = await params;

  const parentCategory = categories.find((c) => c.slug === slug);
  const subMatch = !parentCategory
    ? categories.find((c) => c.subcategories.some((s) => s.slug === slug))
    : null;
  const subCategory = subMatch
    ? subMatch.subcategories.find((s) => s.slug === slug)
    : null;

  const categoryName = parentCategory
    ? parentCategory.name
    : subCategory
      ? subCategory.name
      : slug;

  const parentName = parentCategory
    ? null
    : subMatch
      ? subMatch.name
      : null;

  const parentSlug = parentCategory
    ? null
    : subMatch
      ? subMatch.slug
      : null;

  const subcategories = parentCategory
    ? parentCategory.subcategories
    : [];

  return (
    <main className="min-h-screen bg-offwhite">
      <Navbar />
      <CategoryPage
        categoryName={categoryName}
        parentName={parentName}
        parentSlug={parentSlug}
        subcategories={subcategories}
        isParent={!!parentCategory}
      />
      <Footer />
    </main>
  );
}
