export type FulfilmentType = "dine-in" | "pickup" | "delivery";

export interface ItemModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export type ModifierItem = ItemModifierOption;

export interface OptionItem {
  id: string;
  name: string;
  priceDelta: number;
  isDefault?: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  description?: string;
  type: "single" | "multiple" | "multi";
  required?: boolean;
  minSelect?: number;
  maxSelect?: number;
  minSelections?: number;
  maxSelections?: number;
  items?: OptionItem[];
  options?: OptionItem[];
}

export type SelectedOptionsMap = Record<string, string[]>;

export interface ProductNutrition {
  calories?: number;
  servingSize?: string;
  caffeineMg?: number;
  proteinG?: number;
  protein?: string | number;
  carbs?: string | number;
  fat?: string | number;
  fiber?: string | number;
}

export interface MenuItem {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number; // In USD, server-authoritative
  categoryId: string;
  categoryName: string;
  rating: number;
  reviewCount: number;
  image: string;
  gallery?: string[];
  available: boolean;
  discountPercent?: number;
  isPopular?: boolean;
  isChefSignature?: boolean;
  tags: string[];
  dietary?: (
    | "vegan"
    | "vegetarian"
    | "gluten-free"
    | "organic"
    | "contains-nuts"
  )[];
  calories?: number;
  spiceLevel?: number | "none" | "mild" | "medium" | "hot" | "extra-hot";
  servingSize?: string;
  prepMinutes?: number;
  preparationTimeMinutes?: number;
  nutrition?: ProductNutrition;
  allergens?: string[];
  ingredients?: string[];
  optionGroups?: OptionGroup[];
  relatedIds?: string[];
  options?: {
    sizes?: ItemModifierOption[];
    milks?: ItemModifierOption[];
    extras?: ItemModifierOption[];
  };
}

export interface MenuCategory {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  itemCount?: number;
}

export interface CartItemOptionSelection {
  size?: ItemModifierOption;
  milk?: ItemModifierOption;
  extras?: ItemModifierOption[];
}

export interface CartItem {
  cartItemId: string; // Unique id for cart entry (including custom options)
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: CartItemOptionSelection;
  specialInstructions?: string;
  itemTotalPrice: number; // Computed display subtotal for this item line
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  comment: string;
  rating: number;
  favoriteItem?: string;
}

export interface CafeFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  colSpan?: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  iconName: string;
  duration?: string;
}
