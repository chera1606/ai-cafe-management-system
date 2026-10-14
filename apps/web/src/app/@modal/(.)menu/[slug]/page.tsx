import { ProductModal } from "@/components/product/product-modal";
import { getMenuItem, getRelatedItems } from "@/data/mock-cafe";

interface ModalPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InterceptedProductModalPage({
  params,
}: ModalPageProps) {
  const { slug } = await params;
  const item = await getMenuItem(slug);

  if (!item) {
    return null;
  }

  const relatedItems = await getRelatedItems(item);

  return <ProductModal item={item} relatedItems={relatedItems} />;
}
