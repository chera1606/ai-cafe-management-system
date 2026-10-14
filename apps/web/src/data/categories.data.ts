import type { MenuCategory } from "./types";

export const CATEGORIES: MenuCategory[] = [
  { id: "all", slug: "all", name: "All Offerings", itemCount: 16 },
  { id: "coffee", slug: "coffee", name: "Artisanal Coffee", itemCount: 6 },
  { id: "tea", slug: "tea", name: "Herbal & Spiced Tea", itemCount: 2 },
  {
    id: "cold-drinks",
    slug: "cold-drinks",
    name: "Cold & Juices",
    itemCount: 3,
  },
  { id: "breakfast", slug: "breakfast", name: "Breakfast", itemCount: 3 },
  { id: "pastries", slug: "pastries", name: "Pastries & Bakes", itemCount: 3 },
  { id: "food", slug: "food", name: "Kitchen Mains", itemCount: 4 },
  { id: "desserts", slug: "desserts", name: "Desserts", itemCount: 2 },
];
