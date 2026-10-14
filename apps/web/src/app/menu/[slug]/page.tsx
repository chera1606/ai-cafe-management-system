import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { getMenuItem, getRelatedItems, MENU_ITEMS } from "@/data/mock-cafe";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MENU_ITEMS.map((item) => ({
    slug: item.slug || item.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMenuItem(slug);

  if (!item) {
    return {
      title: "Product Not Found — Sable",
      description: "The requested artisan menu item could not be found.",
    };
  }

  const title = `${item.name} — Sable Artisan Cafe & Roastery`;
  const description =
    item.description ||
    `Order freshly prepared ${item.name} at Sable. Handcrafted with single-origin Ethiopian coffee and seasonal ingredients.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: item.image,
          width: 1200,
          height: 630,
          alt: item.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [item.image],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const item = await getMenuItem(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedItems(item);

  // JSON-LD Structured Data (Schema.org Product)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    image:
      item.gallery && item.gallery.length > 0 ? item.gallery : [item.image],
    description: item.description,
    brand: {
      "@type": "Brand",
      name: "Sable Artisan Cafe & Roastery",
    },
    offers: {
      "@type": "Offer",
      url: `https://sablecafe.com/menu/${item.slug || item.id}`,
      priceCurrency: "USD",
      price: item.price.toFixed(2),
      availability: item.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Sable Cafe",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: item.rating.toString(),
      reviewCount: (item.reviewCount || 100).toString(),
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-sage"
        >
          <Link
            href="/"
            className="hover:text-forest transition-colors flex items-center gap-1"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <Link href="/menu" className="hover:text-forest transition-colors">
            Menu
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <span className="text-forest font-bold truncate max-w-[200px] sm:max-w-none">
            {item.name}
          </span>
        </nav>

        {/* Standalone Product Card Shell */}
        <div className="bg-white rounded-[32px] border border-border shadow-md shadow-forest/5">
          <ProductDetailView
            item={item}
            relatedItems={relatedItems}
            isModal={false}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
