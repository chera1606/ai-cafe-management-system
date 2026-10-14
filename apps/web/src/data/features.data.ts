import type { CafeFeature } from "./types";

export const CAFE_FEATURES: CafeFeature[] = [
  {
    id: "f1",
    title: "Direct-Trade Organic Beans",
    description:
      "Sourced exclusively from single-origin cooperative family farms across Yirgacheffe and Sidama highlands.",
    iconName: "Coffee",
    badge: "100% Single Origin",
    colSpan: "lg:col-span-4",
  },
  {
    id: "f2",
    title: "AI Precision Roasting & Ordering",
    description:
      "Real-time acoustic roast tracking paired with multi-channel conversational AI ordering at counter, table, or web.",
    iconName: "Bot",
    badge: "Next-Gen Tech",
    colSpan: "lg:col-span-4",
  },
  {
    id: "f3",
    title: "Heritage Claypot Ceremonies",
    description:
      "Centuries-old slow-simmered Jebena traditions preserved with live smoking frankincense and communal hospitality.",
    iconName: "Flame",
    badge: "Cultural Ritual",
    colSpan: "lg:col-span-4",
  },
  {
    id: "f4",
    title: "Sustainably Crafted In-House",
    description:
      "Compostable sugarcane packaging, zero bean waste policy, and 100% solar-assisted roasting drums.",
    iconName: "Leaf",
    badge: "Zero Waste",
    colSpan: "lg:col-span-6",
  },
  {
    id: "f5",
    title: "Flexible Order Channels",
    description:
      "Order via web, QR table dock, conversational AI prompt, or tap-to-pay counter with zero friction.",
    iconName: "ShieldCheck",
    badge: "Multi-Channel",
    colSpan: "lg:col-span-6",
  },
];
