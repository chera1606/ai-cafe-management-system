import { CATEGORIES } from "./categories.data";
import { CAFE_FEATURES } from "./features.data";
import { HOW_IT_WORKS_STEPS } from "./how-it-works.data";
import { MENU_ITEMS } from "./menu-items.data";
import { TESTIMONIALS } from "./testimonials.data";
import type {
  CafeFeature,
  HowItWorksStep,
  MenuCategory,
  MenuItem,
  Testimonial,
} from "./types";

export { CATEGORIES } from "./categories.data";
export { CAFE_FEATURES } from "./features.data";
export { HOW_IT_WORKS_STEPS } from "./how-it-works.data";
export { MENU_ITEMS } from "./menu-items.data";
export { TESTIMONIALS } from "./testimonials.data";

// Typed async data access layer (Swappable with NestJS REST API endpoints)
export async function getMenu(): Promise<MenuItem[]> {
  return Promise.resolve(MENU_ITEMS);
}

export async function getCategories(): Promise<MenuCategory[]> {
  return Promise.resolve(CATEGORIES);
}

export async function getFeaturedItems(): Promise<MenuItem[]> {
  return Promise.resolve(MENU_ITEMS.filter((item) => item.isPopular));
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const item = MENU_ITEMS.find((i) => i.id === id);
  return Promise.resolve(item || null);
}

export async function getMenuItem(slug: string): Promise<MenuItem | null> {
  const item = MENU_ITEMS.find((i) => i.slug === slug || i.id === slug);
  return Promise.resolve(item || null);
}

export async function getRelatedItems(item: MenuItem): Promise<MenuItem[]> {
  if (item.relatedIds && item.relatedIds.length > 0) {
    const related = MENU_ITEMS.filter((i) => item.relatedIds?.includes(i.id));
    if (related.length > 0) return Promise.resolve(related);
  }
  // Fallback to same category or popular items
  const fallback = MENU_ITEMS.filter(
    (i) =>
      i.id !== item.id && (i.categoryId === item.categoryId || i.isPopular),
  ).slice(0, 3);
  return Promise.resolve(fallback);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return Promise.resolve(TESTIMONIALS);
}

export async function getCafeFeatures(): Promise<CafeFeature[]> {
  return Promise.resolve(CAFE_FEATURES);
}

export async function getHowItWorks(): Promise<HowItWorksStep[]> {
  return Promise.resolve(HOW_IT_WORKS_STEPS);
}
